import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AppConfigService } from '../app-config.service';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { faAdd, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';

const hideFirstTimeLoginDialogKey = 'hideFirstTimeLoginDialog';

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
    private kubernetesClientService: KubernetesClientService
  ) {}

  ngOnInit(): void {
    if ((window.localStorage.getItem(hideFirstTimeLoginDialogKey) ?? '').length == 0) {
      this.kubernetesClientService.getOrganizationList(1).subscribe((o) => {
        if (o.items.length === 0) {
          this.showFirstLoginDialog = true;
          this.changeDetectorRef.markForCheck();
        }
      });
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

  firstTimeLoginDialogHidden(): void {
    if (this.hideFirstTimeLoginDialogControl.value) {
      window.localStorage.setItem(hideFirstTimeLoginDialogKey, String(new Date().getTime()));
    } else {
      window.localStorage.removeItem(hideFirstTimeLoginDialogKey);
    }
  }
}
