import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, delay, map, Observable, of, retry, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationCollectionService } from '../../store/invitation-collection.service';
import { Invitation, invitationTokenLocalStorageKey } from '../../types/invitation';
import { faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { InvitationRedeemRequestCollectionService } from '../../store/invitation-redeem-request-collection.service';
import { SharedModule } from 'primeng/api';
import { DataServiceError } from '@ngrx/data';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { TeamCollectionService } from '../../store/team-collection.service';
import { HttpClient } from '@angular/common/http';
import { KubernetesUrlGenerator } from '../../store/kubernetes-url-generator.service';
import { invitationEntityKey } from '../../store/entity-metadata-map';
import { BrowserStorageService } from '../../shared/browser-storage.service';
import { InvitationDetailComponent } from '../invitation-detail/invitation-detail.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MessagesModule } from 'primeng/messages';
import { NgIf } from '@angular/common';
import { LetDirective } from '@ngrx/component';
import { NotificationService } from '../../core/notification.service';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-invitation-view',
  templateUrl: './invitation-view.component.html',
  styleUrls: ['./invitation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LetDirective,
    NgIf,
    MessagesModule,
    SharedModule,
    FontAwesomeModule,
    InvitationDetailComponent,
    MessageModule,
  ],
})
export class InvitationViewComponent implements OnInit {
  payload$?: Observable<Payload>;

  faWarning = faWarning;
  faInfo = faInfo;

  constructor(
    private activatedRoute: ActivatedRoute,
    private invitationService: InvitationCollectionService,
    private invitationRedeemRequestService: InvitationRedeemRequestCollectionService,
    private router: Router,
    private http: HttpClient,
    private organizationService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService,
    private teamService: TeamCollectionService,
    private urlGenerator: KubernetesUrlGenerator,
    private storageService: BrowserStorageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const invitationName = this.activatedRoute.snapshot.paramMap.get('name')?.trim() ?? '';
    if (!invitationName) {
      throw new Error('name is required as path parameter in URL');
    }

    const storageAvailable = this.storageService.storageAvailable('localStorage');
    if (!storageAvailable) {
      this.notificationService.showErrorMessageWithTitle(
        $localize`Local storage not available in your browser.`,
        $localize`Local storage is required for redeeming invitations.`
      );
    }
    const tokenInQuery = this.activatedRoute.snapshot.queryParamMap.get('token');
    const tokenFromStorage = this.storageService.getLocalStorageItem(invitationTokenLocalStorageKey);
    const token = tokenFromStorage || tokenInQuery;
    if (token) {
      this.redeemInvitation(invitationName, token);
    } else {
      this.payload$ = this.pollInvitation(invitationName, false).pipe(
        map((invitation) => {
          this.invitationService.upsertOneInCache(invitation);
          return {
            invitation,
          } satisfies Payload;
        })
      );
    }
  }

  private pollInvitation(invitationName: string, waitForTargets: boolean): Observable<Invitation> {
    return this.http.get<Invitation>(this.urlGenerator.getEntity(invitationEntityKey, invitationName, 'GET')).pipe(
      map((invitation) => {
        if (waitForTargets && this.allTargetsUnknown(invitation)) {
          throw new Error('not all targets ready, retrying');
        }
        return invitation;
      }),
      retry({ count: 30, delay: 2000 })
    );
  }

  private redeemInvitation(invitationName: string, token: string): void {
    // try to get the invitation first before making the request, to check if already redeemed.
    const invitation$: Observable<Invitation | undefined> = this.invitationService
      .getByKeyMemoized(invitationName)
      .pipe(
        catchError((err) => {
          // a new user doesn't have access to the invitation, only after redeeming it, so let's ignore some errors.
          if (err instanceof DataServiceError && err.error.status >= 400 && err.error.status <= 404) {
            return of(undefined);
          }
          throw err;
        })
      );
    this.payload$ = invitation$.pipe(
      switchMap((inv) => {
        if (inv && inv.status?.redeemedBy) {
          return of({ isRedeemed: true, invitation: inv } satisfies Payload);
        }
        const redeem$ = this.invitationRedeemRequestService
          .add(this.invitationRedeemRequestService.newInvitationRedeemRequest(invitationName, token))
          .pipe(
            // give some time for the controller to grant permissions in kubernetes, waiting should be good enough in most cases.
            delay(3000),
            switchMap(() => {
              return this.pollInvitation(invitationName, true);
            })
          );
        redeem$.subscribe({
          // this subscription should continue polling even if component is destroyed and user navigated away.
          next: (invitation) => {
            this.invitationService.upsertOneInCache(invitation);
            this.checkInvitation(invitation);
          },
          error: (err) => {
            this.addErrorNotification(err);
          },
        });
        return redeem$.pipe(
          map((invitation) => {
            return { invitation } satisfies Payload;
          }),
          catchError((err) => {
            if (inv) {
              return of({ invitation: inv } satisfies Payload);
            }
            throw err;
          })
        );
      })
    );
    this.storageService.removeLocalStorageItem(invitationTokenLocalStorageKey);
    // remove token from address bar
    void this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { token: undefined } });
  }

  addErrorNotification(err: DataServiceError | Error): void {
    if (err instanceof DataServiceError && err.error.status === 403) {
      this.notificationService.showErrorMessageWithTitle(
        $localize`Redeem failed`,
        $localize`Not allowed, most likely already redeemed`
      );
    } else {
      this.notificationService.showErrorMessage($localize`Redeem failed`);
    }
  }

  private checkInvitation(invitation: Invitation): void {
    if (this.allTargetsReady(invitation)) {
      this.notificationService.showSuccessMessage($localize`Invitation accepted.`);
    }
    if (this.someTargetsFailed(invitation)) {
      this.notificationService.showWarningMessage(
        $localize`Invitation accepted, though not all permissions could be granted.`
      );
    }
    this.billingService.resetMemoization();
    this.organizationService.resetMemoization();
    this.teamService.resetMemoization();
  }

  private allTargetsUnknown(invitation: Invitation): boolean {
    return (
      invitation.status?.targetStatuses?.every((targetStatus) => targetStatus.condition.status === 'Unknown') ?? false
    );
  }

  private allTargetsReady(invitation: Invitation): boolean {
    return (
      invitation.status?.targetStatuses?.every((targetStatus) => targetStatus.condition.status === 'True') ?? false
    );
  }

  private someTargetsFailed(invitation: Invitation): boolean {
    return (
      invitation.status?.targetStatuses?.some((targetStatus) => targetStatus.condition.status === 'False') ?? false
    );
  }
}

interface Payload {
  invitation?: Invitation;
  isRedeemed?: boolean;
}
