import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, Observable, Subscription, take } from 'rxjs';
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
import { EntityOp } from '@ngrx/data';
import { Organization } from '../types/organization';
import { Verb } from '../store/app.reducer';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';

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
    public organizationCollectionService: OrganizationCollectionService,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {}

  ngOnInit(): void {
    this.canAddOrganizations$ = this.ssarCollectionService.isAllowed('rbac.appuio.io', 'organizations', Verb.Create);

    this.organizations$ = this.organizationCollectionService.getAllMemoized().pipe(
      take(1),
      map((orgs) =>
        orgs.map((org) => {
          return {
            organization: org,
            canEdit$: this.ssarCollectionService.isAllowed(
              'rbac.appuio.io',
              'organizations',
              Verb.Update,
              org.metadata.name
            ),
            canViewMembers$: this.ssarCollectionService.isAllowed(
              'appuio.io',
              'organizationmembers',
              Verb.List,
              org.metadata.name
            ),
          } as OrganizationConfig;
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

  loadErrors(): Observable<Error> {
    return this.organizationCollectionService.errors$.pipe(
      filter((action) => action.payload.entityOp == EntityOp.QUERY_ALL_ERROR),
      map((action) => action.payload.data.error.error satisfies Error)
    );
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
