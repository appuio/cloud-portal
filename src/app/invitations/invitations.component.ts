import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation } from '../types/invitation';
import { combineLatestWith, map, Observable } from 'rxjs';
import { faGift, faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { InvitationDetailComponent } from './invitation-detail/invitation-detail.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgFor } from '@angular/common';
import { LetDirective } from '@ngrx/component';

@Component({
    selector: 'app-invitations',
    templateUrl: './invitations.component.html',
    styleUrls: ['./invitations.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        LetDirective,
        NgIf,
        ButtonModule,
        RippleModule,
        RouterLink,
        FontAwesomeModule,
        NgFor,
        InvitationDetailComponent,
        MessagesModule,
        SharedModule,
    ],
})
export class InvitationsComponent implements OnInit {
  payload$?: Observable<Payload>;

  faWarning = faWarning;
  faInfo = faInfo;
  faGift = faGift;

  constructor(private invitationService: InvitationCollectionService) {}

  ngOnInit(): void {
    this.payload$ = this.invitationService.getAllMemoized().pipe(
      combineLatestWith(this.invitationService.canInviteUsers$),
      map(([invitations, canInvite]) => {
        return {
          invitations,
          canInvite,
        } satisfies Payload;
      })
    );
  }
}

interface Payload {
  invitations: Invitation[];
  canInvite: boolean;
}
