import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-join-team-dialog',
  templateUrl: './join-team-dialog.component.html',
  styleUrls: ['./join-team-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinTeamDialogComponent implements OnInit {
  username = '';
  mailto = '';
  faPaperPlane = faPaperPlane;

  constructor(private oAuthService: OAuthService) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const identityClaims = this.oAuthService.getIdentityClaims() as any;
    this.username = identityClaims.preferred_username;
    const name = identityClaims.name;
    const body = encodeURI(
      $localize`Hi\n\nI would like to join the APPUiO Cloud team. My username on APPUiO Cloud is "${this.username}".\n\nBest wishes\n${name}`
    );
    const subject = encodeURI($localize`Join Team`);
    this.mailto = `mailto:?subject=${subject}&body=${body}`;
  }
}
