import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { OAuthService } from 'angular-oauth2-oidc';
import { Md5 } from 'ts-md5';
import { Store } from '@ngrx/store';
import { selectPermission } from './store/app.selectors';
import { take } from 'rxjs';
import { Permission } from './store/app.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
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
  name = '';
  avatarSrc = '';

  constructor(private oauthService: OAuthService, private store: Store) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const identityClaims = this.oauthService.getIdentityClaims() as any;
    this.name = identityClaims.name;
    this.avatarSrc =
      'https://www.gravatar.com/avatar/' + Md5.hashStr(identityClaims.email);

    this.store
      .select(selectPermission)
      .pipe(take(1))
      .subscribe((permission) => this.createMenu(permission));
  }

  private createMenu(permission: Permission): void {
    if (permission.zones) {
      this.menuItems.push({
        label: $localize`Zones`,
        icon: 'pi pi-database',
        routerLink: ['zones'],
      });
    }
  }
}
