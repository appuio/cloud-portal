import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { selectOrganizationSelectionEnabled } from './store/app.selectors';
import { Verb } from './store/app.reducer';
import { faComment, faDatabase, faDollarSign, faGift, faSitemap, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import * as Sentry from '@sentry/browser';
import { AppConfigService } from './app-config.service';
import { IdentityService } from './core/identity.service';
import { catchError, forkJoin } from 'rxjs';
import { OrganizationCollectionService } from './store/organization-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { firstInList, metadataNameFilter } from './store/entity-filter';
import { Organization, OrganizationPermissions } from './types/organization';
import { BillingEntityPermissions } from './types/billing-entity';
import { UserCollectionService } from './store/user-collection.service';
import { ZonePermissions } from './types/zone';
import { InvitationPermissions } from './types/invitation';
import { defaultIfStatusCode } from './store/kubernetes-collection.service';
import { PushPipe } from '@ngrx/component';
import { FirstTimeLoginDialogComponent } from './first-time-login-dialog/first-time-login-dialog.component';
import { RouterOutlet } from '@angular/router';
import { IdentityMenuComponent } from './identity-menu/identity-menu.component';
import { InfoMenuComponent } from './info-menu/info-menu.component';
import { OrganizationSelectionComponent } from './organization-selection/organization-selection.component';
import { StatusBadgeComponent } from './status-badge/status-badge.component';
import { NavbarItemComponent } from './navbar-item/navbar-item.component';
import { StyleClassModule } from 'primeng/styleclass';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    StyleClassModule,
    NavbarItemComponent,
    StatusBadgeComponent,
    NgIf,
    OrganizationSelectionComponent,
    InfoMenuComponent,
    IdentityMenuComponent,
    RouterOutlet,
    FirstTimeLoginDialogComponent,
    PushPipe,
  ],
})
export class AppComponent implements OnInit {
  menuItems: NavMenuItem[] = [];

  name = '';
  username = '';
  avatarSrc = '';
  selectOrganizationSelectionEnabled$ = this.store.select(selectOrganizationSelectionEnabled);
  faComment = faComment;

  constructor(
    private oauthService: OAuthService,
    private store: Store,
    private appConfigService: AppConfigService,
    private identityService: IdentityService,
    private organizationService: OrganizationCollectionService,
    private permissionService: SelfSubjectAccessReviewCollectionService,
    private userService: UserCollectionService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // initial filter, otherwise teams cannot be loaded if no default organization is defined in the user
    this.organizationService.setFilter(firstInList());
    const userName = this.identityService.getUsername();
    this.userService.setFilter(metadataNameFilter(userName));
    this.userService
      .getByKey(userName)
      .pipe(catchError(defaultIfStatusCode(this.userService.newUser(userName), [401, 403, 404])))
      .subscribe({
        next: (user) => {
          if (user.spec.preferences?.defaultOrganizationRef) {
            this.organizationService.setFilter(
              metadataNameFilter(user.spec.preferences?.defaultOrganizationRef ?? '', firstInList<Organization>())
            );
          }
          if (!user.metadata.resourceVersion) {
            this.userService.upsertOneInCache(user);
          }
        },
        error: (err) => {
          console.warn('could not load the user object:', err.message ?? err);
        },
      });

    this.name = this.identityService.getName();
    this.username = this.identityService.getUsername();
    this.avatarSrc = this.identityService.getAvatarUrl();
    const email = this.identityService.getEmail();

    this.createMenu();
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

  private createMenu(): void {
    const canViewZones$ = this.permissionService.isAllowed(ZonePermissions.group, ZonePermissions.resource, Verb.List);
    const canViewOrganizations$ = this.permissionService.isAllowed(
      OrganizationPermissions.group,
      OrganizationPermissions.resource,
      Verb.List
    );
    const canViewBillingEntities$ = this.permissionService.isAllowed(
      BillingEntityPermissions.group,
      BillingEntityPermissions.resource,
      Verb.List
    );
    const canViewInvitations$ = this.permissionService.isAllowed(
      InvitationPermissions.group,
      InvitationPermissions.resource,
      Verb.List
    );

    forkJoin([canViewZones$, canViewOrganizations$, canViewBillingEntities$, canViewInvitations$]).subscribe(
      ([canViewZones, canViewOrganizations, canViewBillingEntities, canViewInvitations]) => {
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
        if (canViewInvitations) {
          this.menuItems.push({
            label: $localize`Invitations`,
            icon: faGift,
            routerLink: ['invitations'],
          });
        }
        // needed to render the menu if other rendering tasks are running in the background,
        // e.g. polling invitations
        this.changeDetectorRef.markForCheck();
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
