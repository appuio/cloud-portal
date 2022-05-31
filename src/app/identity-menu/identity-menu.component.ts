import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faSignOut, faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfigService } from '../app-config.service';
import { NavMenuItem } from '../app.component';

@Component({
  selector: 'app-identity-menu',
  templateUrl: './identity-menu.component.html',
  styleUrls: ['./identity-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdentityMenuComponent {
  profileItems: NavMenuItem[] = [
    {
      label: $localize`User Settings`,
      icon: faUserGear,
      routerLink: ['user'],
    },
    {
      label: $localize`Edit Account`,
      command: () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const iss = this.oauthService.getIdentityClaims().iss;
        const referrer = encodeURI(this.appConfigService.getConfiguration().clientId);
        const referrerUri = `${encodeURI(window.location.href)}`;
        window.location.href = `${iss}/account?referrer=${referrer}&referrer_uri=${referrerUri}`;
      },
      icon: faUser,
    },
    {
      label: $localize`Sign out`,
      icon: faSignOut,
      command: () => this.oauthService.logOut(),
    },
  ];

  @Input() name = '';
  @Input() username = '';
  @Input() avatarSrc = '';

  faUser = faUser;
  faSignOut = faSignOut;
  faUserGear = faUserGear;

  constructor(private oauthService: OAuthService, private appConfigService: AppConfigService) {}
}
