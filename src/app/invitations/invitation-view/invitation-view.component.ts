import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, delay, map, Observable, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationCollectionService } from '../../store/invitation-collection.service';
import { Invitation, invitationTokenLocalStorageKey } from '../../types/invitation';
import { faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { InvitationRedeemRequestCollectionService } from '../../store/invitation-redeem-request-collection.service';
import { MessageService } from 'primeng/api';
import { DataServiceError } from '@ngrx/data';
import { HttpClient } from '@angular/common/http';
import { KubernetesUrlGenerator } from '../../store/kubernetes-url-generator.service';

@Component({
  selector: 'app-invitation-view',
  templateUrl: './invitation-view.component.html',
  styleUrls: ['./invitation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationViewComponent implements OnInit {
  payload$?: Observable<Payload>;

  faWarning = faWarning;
  faInfo = faInfo;

  constructor(
    private activatedRoute: ActivatedRoute,
    private invitationService: InvitationCollectionService,
    private invitationRedeemRequestService: InvitationRedeemRequestCollectionService,
    private messageService: MessageService,
    private router: Router,
    private http: HttpClient,
    private urlGenerator: KubernetesUrlGenerator
  ) {}

  ngOnInit(): void {
    const invitationName = this.activatedRoute.snapshot.paramMap.get('name')?.trim() ?? '';
    if (!invitationName) {
      throw new Error('name is required as path parameter in URL');
    }

    const tokenInQuery = this.activatedRoute.snapshot.queryParamMap.get('token');
    const tokenFromStorage = window.localStorage.getItem(invitationTokenLocalStorageKey);
    const token = tokenFromStorage || tokenInQuery;
    if (token) {
      this.redeemInvitation(invitationName, token);
    } else {
      this.payload$ = this.invitationService.getByKeyMemoized(invitationName).pipe(
        map((invitation) => {
          return {
            invitation,
          };
        })
      );
    }
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
        return this.invitationRedeemRequestService
          .add(this.invitationRedeemRequestService.newInvitationRedeemRequest(invitationName, token))
          .pipe(
            // give some time for the controller to grant permissions in kubernetes, waiting 1s should be good enough in most cases.
            delay(1000),
            switchMap((invReq) => {
              return this.invitationService.getByKey(invReq.metadata.name);
            }),
            map((invitation) => {
              if (
                invitation.status?.targetStatuses?.every((targetStatus) => targetStatus.condition.status === 'True')
              ) {
                this.addSuccessNotification($localize`Invitation accepted. Reload to view the new entities.`);
              }
              if (
                invitation.status?.targetStatuses?.some((targetStatus) => targetStatus.condition.status === 'False')
              ) {
                this.addSuccessNotification(
                  $localize`Invitation accepted, though not all permissions could be granted.`
                );
              }
              return { invitation } satisfies Payload;
            }),
            catchError((err) => {
              this.addErrorNotification(err);
              if (inv) {
                return of({ invitation: inv } satisfies Payload);
              }
              throw err;
            })
          );
      })
    );
    window.localStorage.removeItem(invitationTokenLocalStorageKey);
    // remove token from address bar
    void this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { token: undefined } });
  }

  addErrorNotification(err: DataServiceError | Error): void {
    let detail = err.message ?? '';
    if (err instanceof DataServiceError) {
      if (err.error.status === 403) {
        detail = $localize`Not allowed, most likely already redeemed`;
      } else {
        detail = err.error.message;
      }
    }
    this.messageService.add({
      severity: 'error',
      summary: $localize`Redeem failed`,
      detail: detail,
      sticky: true,
    });
  }
  addSuccessNotification(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Redeem successful',
      detail: detail,
      sticky: true,
      key: 'reload',
    });
  }
}

interface Payload {
  invitation?: Invitation;
  isRedeemed?: boolean;
}
