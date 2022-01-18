import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MenuItem} from "primeng/api";
import {OAuthService} from "angular-oauth2-oidc";
import {Md5} from "ts-md5";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  menuItems: MenuItem[] = [
    {
      label: $localize`Zones`,
      icon: 'pi pi-database',
      routerLink: []
    },
  ];

  profileItems: MenuItem[] = [
    {
      label: $localize`Profile`,
      icon: 'pi pi-user',
    },
    {
      label: $localize`Sign out`,
      icon: 'pi pi-sign-out',
      command: () => this.oauthService.logOut()
    }
  ];
  name: string;
  avatarSrc: string;

  constructor(private oauthService: OAuthService) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.name = (oauthService.getIdentityClaims() as any).name;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.avatarSrc = "https://www.gravatar.com/avatar/" + Md5.hashStr((oauthService.getIdentityClaims() as any).email);
  }
}
