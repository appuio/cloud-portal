import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map, Observable, Subscription } from 'rxjs';
import { faAdd, faEdit, faInfoCircle, faSitemap, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from 'primeng/dynamicdialog';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { selectQueryParam } from '../store/router.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationCollectionService } from './organization-collection.service';
import { EntityOp } from '@ngrx/data';
import { OrganizationPermissionService } from './organization-permission.service';

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
  private showJoinDialogSubscription?: Subscription;

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public organizationCollectionService: OrganizationCollectionService,
    public permissionService: OrganizationPermissionService
  ) {}

  ngOnInit(): void {
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
      filter((action) => {
        return action.payload.entityOp == EntityOp.QUERY_ALL_ERROR;
      }),
      map((action) => {
        return action.payload.data.error.error satisfies Error;
      })
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
