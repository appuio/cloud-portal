import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, map, Observable, of, retry, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationCollectionService } from '../../store/invitation-collection.service';
import { Invitation, InvitationRedeemRequest, invitationTokenLocalStorageKey } from '../../types/invitation';
import { faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { InvitationRedeemRequestCollectionService } from '../../store/invitation-redeem-request-collection.service';
import { MessageService } from 'primeng/api';
import { DataServiceError } from '@ngrx/data';
import { HttpClient } from '@angular/common/http';
import { KubernetesUrlGenerator } from '../../store/kubernetes-url-generator.service';
import { invitationEntityKey } from '../../store/entity-metadata-map';

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
    const invitation$: Observable<Invitation | undefined> = this.invitationService
      .getByKeyMemoized(invitationName)
      .pipe(
        catchError((err) => {
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
            map((invReq) => {
              this.startPollingInvitation(invReq);
              return {
                isRedeeming: true,
              };
            }),
            catchError((err) => {
              this.addErrorNotification(err);
              return of({ isRedeeming: true } satisfies Payload);
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

  startPollingInvitation(invReq: InvitationRedeemRequest): void {
    this.http
      .get<Invitation>(this.urlGenerator.getEntity(invitationEntityKey, invReq.metadata.name, 'GET'))
      .pipe(
        map((inv) => {
          this.invitationService.upsertOneInCache(inv);
          // Even though we might get a response with an Invitation, the actual permissions are granted in a separate, asynchronous process (controller).
          // So we continue to poll as long as there are conditions with "Unknown" status.
          // See https://github.com/appuio/control-api/blob/26efed0b3fd27b2a16d9c3ac4ee30b1866b3e569/controllers/invitation_redeem_controller.go#L69-L81
          if (inv.status?.targetStatuses?.every((targetStatus) => targetStatus.condition.status === 'Unknown')) {
            // As long as every target is still "Unknown", we retry.
            // The controller updates all target status at once, so there are no "Unknown" conditions together with "True" or "False" ones in the array.
            throw new Error(
              $localize`Invitation redeemed, but permissions are not yet granted. Please try to reload later.`
            );
          }
          return inv;
        }),
        retry({ count: 30, delay: 2000 })
      )
      .subscribe({
        next: (inv) => {
          if (inv.status?.targetStatuses?.every((targetStatus) => targetStatus.condition.status === 'True')) {
            this.addSuccessNotification($localize`Invitation accepted. Reload to view the new entities.`);
          }
          if (inv.status?.targetStatuses?.some((targetStatus) => targetStatus.condition.status === 'False')) {
            this.addSuccessNotification($localize`Invitation accepted, though not all permissions could be granted.`);
          }
        },
        error: (err) => {
          this.addErrorNotification(err);
        },
      });
  }
}

interface Payload {
  invitation?: Invitation;
  isRedeeming?: boolean;
  isRedeemed?: boolean;
}
