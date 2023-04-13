import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivationStart, Router } from '@angular/router';
import { faAdd, faCog, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FormControl } from '@angular/forms';
import { IdentityService } from '../core/identity.service';
import { filter, forkJoin, map, Observable, of, take } from 'rxjs';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { UserCollectionService } from '../store/user-collection.service';
import { BrowserStorageService } from '../shared/browser-storage.service';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { switchMap } from 'rxjs/operators';

export const hideFirstTimeLoginDialogKey = 'hideFirstTimeLoginDialog';

@Component({
  selector: 'app-first-time-login-dialog',
  templateUrl: './first-time-login-dialog.component.html',
  styleUrls: ['./first-time-login-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstTimeLoginDialogComponent implements OnInit {
  viewModel$?: Observable<ViewModel>;

  faSitemap = faSitemap;
  faAdd = faAdd;
  faCoq = faCog;
  hideFirstTimeLoginDialogControl = new FormControl(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: BrowserStorageService,
    private changeDetectorRef: ChangeDetectorRef,
    private organizationService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService,
    private identityService: IdentityService,
    private userService: UserCollectionService
  ) {}

  ngOnInit(): void {
    if (this.storageService.getLocalStorageItem(hideFirstTimeLoginDialogKey) === 'true') {
      return;
    }

    this.viewModel$ = forkJoin([
      this.router.events.pipe(
        filter((e) => e instanceof ActivationStart),
        map((e) => {
          return e as ActivationStart;
        }),
        take(2),
        map((e) => e.snapshot.data)
      ),
      this.billingService.canCreateBilling(),
    ]).pipe(
      switchMap(([data, canCreateBilling]) => {
        const hideDialogByRoute: boolean = data[hideFirstTimeLoginDialogKey];
        if (hideDialogByRoute) {
          return of({
            showFirstLoginDialog: false,
          } satisfies ViewModel);
        }
        const be$ = canCreateBilling && !hideDialogByRoute ? this.billingService.getAllMemoized() : of([]);
        return forkJoin([
          be$,
          this.organizationService.getAllMemoized(),
          this.userService.currentUser$.pipe(take(1)),
        ]).pipe(
          map(([beList, orgs, user]) => {
            const userHasDefaultOrganization = !!user?.spec.preferences?.defaultOrganizationRef;
            const userSettingsExists = user.metadata.resourceVersion !== undefined;
            const userBelongsToBilling = beList.length > 0;
            const userBelongsToOrganization = orgs.length > 0;
            return {
              showFirstLoginDialog: !userBelongsToOrganization || !userHasDefaultOrganization,
              userBelongsToOrganization,
              showJoinOrganizationButton: !userBelongsToOrganization,
              showSetDefaultOrganizationButton:
                !userHasDefaultOrganization && userBelongsToOrganization && userSettingsExists,
              showAddBillingButton: !userBelongsToBilling && canCreateBilling,
              showAddOrganizationButton: !userBelongsToOrganization && userBelongsToBilling,
            } satisfies ViewModel;
          })
        );
      })
    );
  }

  hideDialog(vm: ViewModel): void {
    vm.showFirstLoginDialog = false;
  }

  onHide(): void {
    if (this.hideFirstTimeLoginDialogControl.value) {
      this.storageService.setLocalStorageItem(hideFirstTimeLoginDialogKey, 'true');
    } else {
      this.storageService.removeLocalStorageItem(hideFirstTimeLoginDialogKey);
    }
  }
}

interface ViewModel {
  showFirstLoginDialog: boolean;
  userBelongsToOrganization?: boolean;
  showJoinOrganizationButton?: boolean;
  showSetDefaultOrganizationButton?: boolean;
  showAddBillingButton?: boolean;
  showAddOrganizationButton?: boolean;
}
