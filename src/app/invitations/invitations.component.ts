import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { InvitationCollectionService } from '../store/invitation-collection.service';
import { Invitation } from '../types/invitation';
import { map, Observable } from 'rxjs';
import { faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import * as dayjs from 'dayjs';

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

  constructor(private invitationService: InvitationCollectionService) {}

  ngOnInit(): void {
    this.payload$ = this.invitationService.getAllMemoized().pipe(
      map((invitations) => {
        return {
          invitations: invitations.map((inv) => {
            const expires = dayjs(inv.status?.validUntil);
            const hasExpired = expires.isBefore(dayjs());
            return {
              expires: `${expires.format('LLLL')} (${expires.fromNow()})`,
              hasExpired: hasExpired,
              model: inv,
            } satisfies InvitationViewModel;
          }),
        } satisfies Payload;
      })
    );
  }
}

interface Payload {
  invitations: InvitationViewModel[];
}

interface InvitationViewModel {
  model: Invitation;
  expires: string;
  hasExpired: boolean;
}
