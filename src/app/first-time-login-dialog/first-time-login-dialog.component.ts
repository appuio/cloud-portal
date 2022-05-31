import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { faAdd, faSitemap, faCog } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { IdentityService } from '../core/identity.service';
import { OrganizationList } from '../types/organization';
import { forkJoin, Subscription } from 'rxjs';
import { User } from '../types/user';
import { selectUser } from '../store/app.selectors';
import { Entity } from '../types/entity';

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

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private kubernetesClientService: KubernetesClientService,
    private identityService: IdentityService,
    private store: Store
  ) {}

  ngOnInit(): void {
    if (window.localStorage.getItem(hideFirstTimeLoginDialogKey) !== 'true') {
      this.getOrgSub = this.kubernetesClientService.getOrganizationList().subscribe((organizationList) => {
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

  private showFirstLoginDialogIfNecessary(organizationList: OrganizationList): void {
    this.userBelongsToOrganization = organizationList.items.length > 0;
    if (!this.userBelongsToOrganization || !this.userHasDefaultOrganization) {
      this.showFirstLoginDialog = true;
      this.changeDetectorRef.markForCheck();
      return;
    }

    const getOrganizationMembersRequests = organizationList.items.map((organization) =>
      this.kubernetesClientService.getOrganizationMembers(organization.metadata.name)
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
