import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AppConfigService } from '../app-config.service';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { faAdd, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { OrganizationMemberList } from '../types/organization-members';
import { IdentityService } from '../core/identity.service';

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

  constructor(
    private oauthService: OAuthService,
    private store: Store,
    private router: Router,
    private appConfigService: AppConfigService,
    private changeDetectorRef: ChangeDetectorRef,
    private kubernetesClientService: KubernetesClientService,
    private identityService: IdentityService
  ) {}

  ngOnInit(): void {
    if (window.localStorage.getItem(hideFirstTimeLoginDialogKey) !== 'true') {
      this.kubernetesClientService
        .getOrganizationMemberList()
        .subscribe((organizationMemberList: OrganizationMemberList) =>
          this.showFirstLoginDialogIfNecessary(organizationMemberList)
        );
    }
  }

  private showFirstLoginDialogIfNecessary(organizationMemberList: OrganizationMemberList): void {
    const usernames = organizationMemberList.items.flatMap((o) => o.spec.userRefs.map((userRef) => userRef.name));
    if (!usernames.includes(this.identityService.getUsername())) {
      this.showFirstLoginDialog = true;
      this.changeDetectorRef.markForCheck();
    }
  }

  addOrganization(): void {
    this.showFirstLoginDialog = false;
    void this.router.navigate(['organizations/$new']);
  }

  joinOrganization(): void {
    this.showFirstLoginDialog = false;
    void this.router.navigate(['organizations'], { queryParams: { showJoinDialog: true } });
  }

  firstTimeLoginDialogHide(): void {
    if (this.hideFirstTimeLoginDialogControl.value) {
      window.localStorage.setItem(hideFirstTimeLoginDialogKey, 'true');
    } else {
      window.localStorage.removeItem(hideFirstTimeLoginDialogKey);
    }
  }
}
