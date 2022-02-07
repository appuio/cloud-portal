import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Md5 } from 'ts-md5';
import { Store } from '@ngrx/store';
import { selectPermission } from './store/app.selectors';
import { take } from 'rxjs';
import { Permission, Verb } from './store/app.reducer';
import { faSignOut, faSitemap, faUser } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  menuItems: NavMenuItem[] = [];

  profileItems: NavMenuItem[] = [
    {
      label: $localize`Profile`,
      icon: faUser,
    },
    {
      label: $localize`Sign out`,
      icon: faSignOut,
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
    this.avatarSrc = 'https://www.gravatar.com/avatar/' + Md5.hashStr(identityClaims.email);

    this.store
      .select(selectPermission)
      .pipe(take(1))
      .subscribe((permission) => this.createMenu(permission));
  }

  private createMenu(permission: Permission): void {
    if (permission.zones.includes(Verb.List)) {
      this.menuItems.push({
        label: $localize`Zones`,
        icon: faDatabase,
        routerLink: ['zones'],
      });
    }
    if (permission.organizations.includes(Verb.List)) {
      this.menuItems.push({
        label: $localize`Organizations`,
        icon: faSitemap,
        routerLink: ['organizations'],
      });
    }
  }
}

export interface NavMenuItem {
  items?: NavMenuItem[];
  label: string;
  icon: IconDefinition;
  command?: () => void;
  routerLink?: string[];
}
