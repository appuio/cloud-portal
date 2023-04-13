import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatestAll, filter, forkJoin, from, map, Observable, of, Subscription, switchMap } from 'rxjs';
import {
  faAdd,
  faDollarSign,
  faEdit,
  faInfoCircle,
  faSitemap,
  faUserGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { Organization } from '../types/organization';
import { OrganizationMembersCollectionService } from '../store/organizationmembers-collection.service';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  faInfo = faInfoCircle;
  faWarning = faWarning;
  faEdit = faEdit;
  faAdd = faAdd;
  faSitemap = faSitemap;
  faUserGroup = faUserGroup;
  faDollarSign = faDollarSign;
  subscriptions: Subscription[] = [];

  organizations$?: Observable<ViewModel>;

  constructor(
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public organizationService: OrganizationCollectionService,
    private organizationMembersService: OrganizationMembersCollectionService,
    private billingService: BillingEntityCollectionService
  ) {}

  ngOnInit(): void {
    this.organizations$ = forkJoin([
      this.organizationService.canAddOrganizations$,
      this.billingService.canViewBillingEntities$,
      this.organizationService.getAllMemoized(),
    ]).pipe(
      switchMap(([canAddOrganizations, canViewBilling, orgs]) => {
        if (orgs.length === 0 && canAddOrganizations && canViewBilling) {
          void this.router.navigate(['organizations', '$new'], {
            queryParams: { firstTime: undefined },
            queryParamsHandling: 'merge',
          });
          return forkJoin([of(canAddOrganizations), of([])]);
        }
        return forkJoin([of(canAddOrganizations), this.fetchOrganizationData$(orgs)]);
      }),
      map(([canAddOrganizations, orgVMList]) => {
        const vm: ViewModel = {
          canAddOrganizations,
          organizations: orgVMList,
        };
        return vm;
      })
    );

    this.subscriptions.push(
      this.activatedRoute.queryParamMap
        .pipe(
          map((q) => q.get('showJoinDialog')),
          filter((v) => v === 'true')
        )
        .subscribe(() => {
          this.openJoinOrganizationDialog();
          void this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { showJoinDialog: undefined },
            queryParamsHandling: 'merge',
          });
        })
    );
  }

  private fetchOrganizationData$(orgs: Organization[]): Observable<OrganizationViewModel[]> {
    if (orgs.length === 0) {
      return of([]);
    }
    const list = orgs.map((org) => {
      return forkJoin([
        of(org),
        this.organizationService.canEditOrganization(org),
        this.organizationMembersService.canViewMembers(org.metadata.name),
      ]).pipe(
        map(([organization, canEdit, canViewMembers]) => {
          const orgVM: OrganizationViewModel = {
            organization,
            canEdit,
            canViewMembers,
          };
          return orgVM;
        })
      );
    });
    return from(list).pipe(combineLatestAll());
  }

  openJoinOrganizationDialog(): void {
    this.dialogService.open(JoinOrganizationDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Organization`,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}

interface ViewModel {
  organizations: OrganizationViewModel[];
  canAddOrganizations: boolean;
}

interface OrganizationViewModel {
  organization: Organization;
  canEdit: boolean;
  canViewMembers: boolean;
}
