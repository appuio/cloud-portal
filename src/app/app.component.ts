import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { selectOrganizationSelectionEnabled, selectPermission } from './store/app.selectors';
import { Permission, Verb } from './store/app.reducer';
import { faComment, faDatabase, faDollarSign, faSitemap, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import * as Sentry from '@sentry/browser';
import { AppConfigService } from './app-config.service';
import { loadUser } from './store/app.actions';
import { IdentityService } from './core/identity.service';
import { filter, take } from 'rxjs';
import { OrganizationCollectionService } from './organizations/organization-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { firstInList } from './store/entity-filter';
import { composeSsarId } from './store/entity-metadata-map';
import { SelfSubjectAccessReview } from './types/self-subject-access-review';

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
    private identityService: IdentityService,
    private organizationService: OrganizationCollectionService,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {}

  ngOnInit(): void {
    // pre-load some entities into cache
    clusterStartupAccessChecks.forEach((s) => this.ssarCollectionService.getByKey(s));
    // initial filter, otherwise teams cannot be loaded if no default organization is defined in the user
    this.organizationService.setFilter(firstInList());
    this.organizationService.getAll().subscribe();

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
    this.ssarCollectionService
      .isAllowed('billing.appuio.io', 'billingentities', Verb.List, '')
      .pipe(
        // The underlying SSAR collection may change as they get loaded at app start, so we limit to only 1 if allowed,
        // otherwise there could be multiple menuitems for the same.
        filter((allowed) => allowed),
        take(1)
      )
      .subscribe(() => {
        this.menuItems.push({
          label: $localize`Billing Entities`,
          icon: faDollarSign,
          routerLink: ['billingentities'],
        });
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

const clusterStartupAccessChecks = [
  composeSsarId(new SelfSubjectAccessReview(Verb.List, 'organizations', 'rbac.appuio.io', '')),
  composeSsarId(new SelfSubjectAccessReview(Verb.Create, 'organizations', 'rbac.appuio.io', '')),
  composeSsarId(new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', '')),
  composeSsarId(new SelfSubjectAccessReview(Verb.List, 'billingentities', 'billing.appuio.io', '')),
];
