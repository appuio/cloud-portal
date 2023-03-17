import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation } from '../types/invitation';
import { combineLatestWith, map, Observable } from 'rxjs';
import { faGift, faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
