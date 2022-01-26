import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { OAuthService } from 'angular-oauth2-oidc';
import { Md5 } from 'ts-md5';
import { Store } from '@ngrx/store';
import { selectPermissions } from './store/app.selectors';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  menuItems: MenuItem[] = [];

  profileItems: MenuItem[] = [
    {
      label: $localize`Profile`,
      icon: 'pi pi-user',
    },
    {
      label: $localize`Sign out`,
      icon: 'pi pi-sign-out',
      command: () => this.oauthService.logOut(),
    },
  ];
  name: string;
  avatarSrc: string;

  constructor(private oauthService: OAuthService, private store: Store) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.name = (oauthService.getIdentityClaims() as any).name;
    this.avatarSrc =
      'https://www.gravatar.com/avatar/' +
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Md5.hashStr((oauthService.getIdentityClaims() as any).email);

    this.store
      .select(selectPermissions)
      .pipe(take(1))
      .subscribe((permission) => {
        if (permission.zones) {
          this.menuItems.push({
            label: $localize`Zones`,
            icon: 'pi pi-database',
            routerLink: ['zones'],
          });
        }
      });
  }
}
