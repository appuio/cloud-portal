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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { Organization } from '../types/organization';
import { OrganizationMembersCollectionService } from '../store/organizationmembers-collection.service';
import { JoinDialogService } from '../join-dialog/join-dialog.service';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgFor } from '@angular/common';
import { LetDirective } from '@ngrx/component';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    LetDirective,
    NgIf,
    ButtonModule,
    RippleModule,
    FontAwesomeModule,
    RouterLink,
    NgFor,
    MessagesModule,
    SharedModule,
  ],
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
    private billingService: BillingEntityCollectionService,
    public joinDialogService: JoinDialogService
  ) {}

  ngOnInit(): void {
    this.organizations$ = forkJoin([
      this.organizationService.canAddOrganizations$,
      this.organizationService.getAllMemoized(),
    ]).pipe(
      switchMap(([canAddOrganizations, orgs]) => {
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
          this.joinDialogService.showDialog();
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
        org.spec.billingEntityRef ? this.billingService.canViewBilling(org.spec.billingEntityRef) : of(false),
      ]).pipe(
        map(([organization, canEdit, canViewMembers, canViewBillingEntity]) => {
          const orgVM: OrganizationViewModel = {
            organization,
            canEdit,
            canViewMembers,
            canViewBillingEntity,
          };
          return orgVM;
        })
      );
    });
    return from(list).pipe(combineLatestAll());
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
  canViewBillingEntity: boolean;
}
