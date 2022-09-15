import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { selectOrganizationSelectionEnabled, selectPermission } from './store/app.selectors';
import { Permission, Verb } from './store/app.reducer';
import { faSitemap, faUserGroup, faComment } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import * as Sentry from '@sentry/browser';
import { AppConfigService } from './app-config.service';
import { loadOrganizations, loadUser } from './store/app.actions';
import { IdentityService } from './core/identity.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  menuItems: NavMenuItem[] = [];

  name = '';
  username = '';
  avatarSrc = '';
  selectOrganizationSelectionEnabled$ = this.store.select(selectOrganizationSelectionEnabled);
  faSitemap = faSitemap;
  faComment = faComment;

  constructor(
    private oauthService: OAuthService,
    private store: Store,
    private appConfigService: AppConfigService,
    private identityService: IdentityService
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line ngrx/avoid-dispatching-multiple-actions-sequentially
    this.store.dispatch(loadOrganizations());

    // eslint-disable-next-line ngrx/avoid-dispatching-multiple-actions-sequentially
    this.store.dispatch(loadUser({ username: this.identityService.getUsername() }));

    this.name = this.identityService.getName();
    this.username = this.identityService.getUsername();
    this.avatarSrc = this.identityService.getAvatarUrl();
    const email = this.identityService.getEmail();

    this.store
      .select(selectPermission)
      .pipe(take(1))
      .subscribe((permission) => this.createMenu(permission));

    this.setupGlitchTip(this.name, email, this.username);
  }

  setupGlitchTip(name: string, email: string, username: string): void {
    const config = this.appConfigService.getConfiguration();
    if (config.glitchTipDsn?.length) {
      Sentry.init({
        dsn: config.glitchTipDsn,
        environment: config.environment,
        release: config.version,
        autoSessionTracking: false,
        tracesSampleRate: 0.01,
      });
      Sentry.setUser({
        name: name,
        email: email,
        username: username,
      });
    }
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
    this.menuItems.push({
      label: $localize`Teams`,
      icon: faUserGroup,
      routerLink: ['teams'],
    });
  }
}

export interface NavMenuItem {
  items?: NavMenuItem[];
  label: string;
  icon: IconDefinition;
  command?: () => void;
  routerLink?: string[];
}
