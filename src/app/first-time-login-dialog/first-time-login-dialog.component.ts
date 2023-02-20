import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { faAdd, faCog, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { IdentityService } from '../core/identity.service';
import { Organization } from '../types/organization';
import { forkJoin, Subscription } from 'rxjs';
import { User } from '../types/user';
import { selectUser } from '../store/app.selectors';
import { Entity } from '../types/entity';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../store/kubernetes-collection.service';
import { OrganizationMembers } from '../types/organization-members';
import { organizationMembersEntityKey } from '../store/entity-metadata-map';

export const hideFirstTimeLoginDialogKey = 'hideFirstTimeLoginDialog';

@Component({
  selector: 'app-first-time-login-dialog',
  templateUrl: './first-time-login-dialog.component.html',
  styleUrls: ['./first-time-login-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstTimeLoginDialogComponent implements OnInit, OnDestroy {
  showFirstLoginDialog = false;
  faSitemap = faSitemap;
  faAdd = faAdd;
  faCoq = faCog;
  hideFirstTimeLoginDialogControl = new FormControl(false);
  nextAction?: 'join' | 'add' | 'setDefault';
  userHasDefaultOrganization = true;
  userBelongsToOrganization = true;
  getOrgSub?: Subscription;
  selectUserSub?: Subscription;
  private organizationMembersService: KubernetesCollectionService<OrganizationMembers>;

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private kubernetesClientService: KubernetesClientService,
    private kubernetesServiceFactory: KubernetesCollectionServiceFactory<OrganizationMembers>,
    private organizationService: OrganizationCollectionService,
    private identityService: IdentityService,
    private store: Store
  ) {
    this.organizationMembersService = kubernetesServiceFactory.create(organizationMembersEntityKey);
  }

  ngOnInit(): void {
    if (window.localStorage.getItem(hideFirstTimeLoginDialogKey) !== 'true') {
      this.getOrgSub = this.organizationService.getAllMemoized().subscribe((organizationList) => {
        // eslint-disable-next-line ngrx/no-store-subscription
        this.selectUserSub = this.store.select(selectUser).subscribe((user: Entity<User | null>) => {
          this.userHasDefaultOrganization = !!this.getDefaultOrganization(user);
          this.showFirstLoginDialogIfNecessary(organizationList);
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.getOrgSub?.unsubscribe();
    this.selectUserSub?.unsubscribe();
  }

  private showFirstLoginDialogIfNecessary(organizationList: Organization[]): void {
    this.userBelongsToOrganization = organizationList.length > 0;
    if (!this.userBelongsToOrganization || !this.userHasDefaultOrganization) {
      this.showFirstLoginDialog = true;
      this.changeDetectorRef.markForCheck();
      return;
    }

    const getOrganizationMembersRequests = organizationList.map((organization) =>
      this.organizationMembersService.getByKeyMemoized(`${organization.metadata.name}/members`)
    );

    forkJoin(getOrganizationMembersRequests).subscribe((members) => {
      const usernames = members
        .map((organizationMembers) => (organizationMembers.spec.userRefs ?? []).map((userRef) => userRef.name))
        .flatMap((usernames) => usernames);
      if (!usernames.includes(this.identityService.getUsername())) {
        this.userBelongsToOrganization = false;
        this.showFirstLoginDialog = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  getDefaultOrganization(user: Entity<User | null>): string | null | undefined {
    return user?.value?.spec.preferences?.defaultOrganizationRef;
  }

  addOrganization(): void {
    this.showFirstLoginDialog = false;
    this.nextAction = 'add';
  }

  joinOrganization(): void {
    this.showFirstLoginDialog = false;
    this.nextAction = 'join';
  }

  setDefaultOrganization(): void {
    this.showFirstLoginDialog = false;
    this.nextAction = 'setDefault';
  }

  onHide(): void {
    this.firstTimeLoginDialogHide();
    if (this.nextAction === 'add') {
      void this.router.navigate(['organizations/$new']);
    } else if (this.nextAction === 'join') {
      void this.router.navigate(['organizations'], { queryParams: { showJoinDialog: true } });
    } else if (this.nextAction === 'setDefault') {
      void this.router.navigate(['user']);
    }
  }

  firstTimeLoginDialogHide(): void {
    if (this.hideFirstTimeLoginDialogControl.value) {
      window.localStorage.setItem(hideFirstTimeLoginDialogKey, 'true');
    } else {
      window.localStorage.removeItem(hideFirstTimeLoginDialogKey);
    }
  }
}
