import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, Subscription, take } from 'rxjs';
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
import { selectQueryParam } from '../store/router.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationCollectionService } from '../store/organization-collection.service';
import { Organization } from '../types/organization';
import { OrganizationMembersCollectionService } from '../store/organizationmembers-collection.service';

interface OrganizationConfig {
  organization: Organization;
  canEdit$: Observable<boolean>;
  canViewMembers$: Observable<boolean>;
}

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
  private showJoinDialogSubscription?: Subscription;
  organizations$?: Observable<OrganizationConfig[]>;
  canAddOrganizations$?: Observable<boolean>;

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public organizationService: OrganizationCollectionService,
    private organizationMembersService: OrganizationMembersCollectionService
  ) {}

  ngOnInit(): void {
    this.canAddOrganizations$ = this.organizationService.canAddOrganizations$;

    this.organizations$ = this.organizationService.getAllMemoized().pipe(
      take(1),
      map((orgs) =>
        orgs.map((org) => {
          return {
            organization: org,
            canEdit$: this.organizationService.canEditOrganization(org),
            canViewMembers$: this.organizationMembersService.canViewMembers(org.metadata.name),
          } satisfies OrganizationConfig;
        })
      )
    );
    this.showJoinDialogSubscription = this.store
      .select(selectQueryParam('showJoinDialog'))
      // eslint-disable-next-line ngrx/no-store-subscription
      .subscribe((showJoinDialog) => {
        if (showJoinDialog) {
          this.openJoinOrganizationDialog();
          this.router.navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { showJoinDialog: undefined },
            queryParamsHandling: 'merge',
          });
        }
      });
  }

  openJoinOrganizationDialog(): void {
    this.dialogService.open(JoinOrganizationDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Organization`,
    });
  }

  ngOnDestroy(): void {
    this.showJoinDialogSubscription?.unsubscribe();
  }
}
