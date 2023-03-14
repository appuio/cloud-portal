import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { InvitationCollectionService } from '../../store/invitation-collection.service';
import { Invitation } from '../../types/invitation';
import { faWarning } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-invitation-view',
  templateUrl: './invitation-view.component.html',
  styleUrls: ['./invitation-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationViewComponent implements OnInit {
  invitation$?: Observable<Invitation>;

  faWarning = faWarning;

  constructor(private activatedRoute: ActivatedRoute, private invitationService: InvitationCollectionService) {}

  ngOnInit(): void {
    const name = this.activatedRoute.snapshot.paramMap.get('name') ?? '';
    if (!name) {
      throw new Error('name is required as path parameter in URL');
    }

    this.invitation$ = this.invitationService.getByKeyMemoized(name);
  }
}
