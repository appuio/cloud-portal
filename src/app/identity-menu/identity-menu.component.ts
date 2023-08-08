import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faSignOut, faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfigService } from '../app-config.service';
import { NavMenuItem } from '../app.component';
import { NavbarItemComponent } from '../navbar-item/navbar-item.component';
import { NgFor } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-identity-menu',
    templateUrl: './identity-menu.component.html',
    styleUrls: ['./identity-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        RippleModule,
        StyleClassModule,
        NgFor,
        NavbarItemComponent,
    ],
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
        const iss = this.oauthService.getIdentityClaims()['iss'];
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

  constructor(private oauthService: OAuthService, private appConfigService: AppConfigService) {}
}
