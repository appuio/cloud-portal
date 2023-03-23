import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { catchError, map, Observable, of, retry } from 'rxjs';
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
    const invitationName = this.activatedRoute.snapshot.paramMap.get('name') ?? '';
    if (!invitationName) {
      throw new Error('name is required as path parameter in URL');
    }

    const tokenInQuery = this.activatedRoute.snapshot.queryParamMap.get('token');
    const tokenFromStorage = window.localStorage.getItem(invitationTokenLocalStorageKey);
    const token = tokenFromStorage || tokenInQuery;
    if (token) {
      this.payload$ = this.invitationRedeemRequestService
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
            return of({ isRedeeming: true });
          })
        );
      window.localStorage.removeItem(invitationTokenLocalStorageKey);
      // remove token from address bar
      void this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: { token: undefined } });
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

  addErrorNotification(err: DataServiceError | Error): void {
    console.log('err', err);
    let detail = err.message ?? '';
    if (err instanceof DataServiceError) {
      detail = err.error.message;
    }
    this.messageService.add({
      severity: 'error',
      summary: $localize`Redeem failed`,
      detail: detail,
      sticky: true,
    });
  }
  addSuccessNotification(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Redeem successful',
      detail: $localize`Invitation accepted.`,
      sticky: true,
      key: 'reload',
    });
  }

  startPollingInvitation(invReq: InvitationRedeemRequest): void {
    this.http
      .get<Invitation>(this.urlGenerator.getEntity(invitationEntityKey, invReq.metadata.name, 'READ'))
      .pipe(retry({ count: 30, delay: 2000 }))
      .subscribe({
        next: (inv) => {
          this.invitationService.addOneToCache(inv);
          if (inv.status?.redeemedBy) {
            this.addSuccessNotification();
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
}
