import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AppConfigService } from '../app-config.service';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { faAdd, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { IdentityService } from '../core/identity.service';
import { OrganizationList } from '../types/organization';
import { forkJoin } from 'rxjs';

export const hideFirstTimeLoginDialogKey = 'hideFirstTimeLoginDialog';

@Component({
  selector: 'app-first-time-login-dialog',
  templateUrl: './first-time-login-dialog.component.html',
  styleUrls: ['./first-time-login-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstTimeLoginDialogComponent implements OnInit {
  showFirstLoginDialog = false;
  faSitemap = faSitemap;
  faAdd = faAdd;
  hideFirstTimeLoginDialogControl = new FormControl(false);
  nextAction?: 'join' | 'add';

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private kubernetesClientService: KubernetesClientService,
    private identityService: IdentityService
  ) {}

  ngOnInit(): void {
    if (window.localStorage.getItem(hideFirstTimeLoginDialogKey) !== 'true') {
      this.kubernetesClientService
        .getOrganizationList()
        .subscribe((organizationList) => this.showFirstLoginDialogIfNecessary(organizationList));
    }
  }

  private showFirstLoginDialogIfNecessary(organizationList: OrganizationList): void {
    if (organizationList.items.length === 0) {
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
        this.showFirstLoginDialog = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  addOrganization(): void {
    this.showFirstLoginDialog = false;
    this.nextAction = 'add';
  }

  joinOrganization(): void {
    this.showFirstLoginDialog = false;
    this.nextAction = 'join';
  }

  onHide(): void {
    this.firstTimeLoginDialogHide();
    if (this.nextAction === 'add') {
      void this.router.navigate(['organizations/$new']);
    } else if (this.nextAction === 'join') {
      void this.router.navigate(['organizations'], { queryParams: { showJoinDialog: true } });
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
