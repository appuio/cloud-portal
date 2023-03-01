import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { selectOrganizationSelectionEnabled, selectPermission } from './store/app.selectors';
import { Permission, Verb } from './store/app.reducer';
import { faComment, faDatabase, faDollarSign, faSitemap, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import * as Sentry from '@sentry/browser';
import { AppConfigService } from './app-config.service';
import { IdentityService } from './core/identity.service';
import { forkJoin, of, take } from 'rxjs';
import { OrganizationCollectionService } from './store/organization-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { firstInList, metadataNameFilter } from './store/entity-filter';
import { OrganizationPermissions } from './types/organization';
import { BillingEntityPermissions } from './types/billing-entity';
import { UserCollectionService } from './store/user-collection.service';

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
    private permissionService: SelfSubjectAccessReviewCollectionService,
    private userService: UserCollectionService
  ) {}

  ngOnInit(): void {
    // initial filter, otherwise teams cannot be loaded if no default organization is defined in the user
    this.organizationService.setFilter(firstInList());
    this.userService.setFilter(metadataNameFilter(this.identityService.getUsername()));
    this.userService.getByKey(this.identityService.getUsername()).subscribe();

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
    const canViewZones$ = of(permission.zones.includes(Verb.List));
    const canViewOrganizations$ = this.permissionService.isAllowed(
      OrganizationPermissions.group,
      OrganizationPermissions.resource,
      Verb.List
    );
    const canViewBillingEntities = this.permissionService.isAllowed(
      BillingEntityPermissions.group,
      BillingEntityPermissions.resource,
      Verb.List
    );

    forkJoin([canViewZones$, canViewOrganizations$, canViewBillingEntities]).subscribe(
      ([canViewZones, canViewOrganizations, canViewBillingEntities]) => {
        if (canViewZones) {
          this.menuItems.push({
            label: $localize`Zones`,
            icon: faDatabase,
            routerLink: ['zones'],
          });
        }
        if (canViewOrganizations) {
          this.menuItems.push({
            label: $localize`Organizations`,
            icon: faSitemap,
            routerLink: ['organizations'],
          });
        }
        // always render team menu, as teams are namespace scoped.
        this.menuItems.push({
          label: $localize`Teams`,
          icon: faUserGroup,
          routerLink: ['teams'],
        });
        if (canViewBillingEntities) {
          this.menuItems.push({
            label: $localize`Billing`,
            icon: faDollarSign,
            routerLink: ['billingentities'],
          });
        }
      }
    );
  }
}

export interface NavMenuItem {
  items?: NavMenuItem[];
  label: string;
  icon: IconDefinition;
  command?: () => void;
  routerLink?: string[];
}
