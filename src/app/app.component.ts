import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Md5 } from 'ts-md5';
import { Store } from '@ngrx/store';
import {
  selectFocusOrganizationName,
  selectOrganizations,
  selectOrganizationSelectionEnabled,
  selectPermission,
} from './store/app.selectors';
import { Observable, Subscription, take } from 'rxjs';
import { Permission, Verb } from './store/app.reducer';
import { faBook, faSignOut, faSitemap, faUser, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import * as Sentry from '@sentry/browser';
import { AppConfigService } from './app-config.service';
import { loadOrganizations, setFocusOrganization } from './store/app.actions';
import { Organization } from './types/organization';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  menuItems: NavMenuItem[] = [];

  profileItems: NavMenuItem[] = [
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
  name = '';
  username = '';
  avatarSrc = '';
  selectOrganizationSelectionEnabled$ = this.store.select(selectOrganizationSelectionEnabled);
  organizations$: Observable<Organization[]> = this.store.select(selectOrganizations);
  organizationControl = new FormControl();
  subscriptions: Subscription[] = [];

  constructor(private oauthService: OAuthService, private store: Store, private appConfigService: AppConfigService) {}

  ngOnInit(): void {
    this.store.dispatch(loadOrganizations());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const identityClaims = this.oauthService.getIdentityClaims() as any;
    this.name = identityClaims.name;
    this.username = identityClaims.preferred_username;
    const hash = identityClaims.email?.length ? Md5.hashStr(identityClaims.email) : '';
    this.avatarSrc = 'https://www.gravatar.com/avatar/' + hash;

    this.store
      .select(selectPermission)
      .pipe(take(1))
      .subscribe((permission) => this.createMenu(permission));

    this.subscriptions.push(
      this.store
        .select(selectFocusOrganizationName)
        // eslint-disable-next-line ngrx/no-store-subscription
        .subscribe((organizationName) => this.organizationControl.setValue(organizationName, { emitEvent: false }))
    );

    this.subscriptions.push(
      this.organizationControl.valueChanges.subscribe((focusOrganizationName) =>
        this.store.dispatch(setFocusOrganization({ focusOrganizationName }))
      )
    );

    this.setupGlitchTip(identityClaims.name, identityClaims.email, identityClaims.preferred_username);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
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
    if (permission.teams.includes(Verb.List)) {
      this.menuItems.push({
        label: $localize`Teams`,
        icon: faUserGroup,
        routerLink: ['teams'],
      });
    }

    this.menuItems.push({
      label: $localize`References`,
      icon: faBook,
      routerLink: ['references'],
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
