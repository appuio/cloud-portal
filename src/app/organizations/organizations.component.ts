import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, Subscription } from 'rxjs';
import { faAdd, faEdit, faInfoCircle, faSitemap, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { selectHasPermission } from '../store/app.selectors';
import { Verb } from '../store/app.reducer';
import { DialogService } from 'primeng/dynamicdialog';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { selectQueryParam } from '../store/router.selectors';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityCollectionService, EntityCollectionServiceFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { organizationEntityKey } from '../store/entity-metadata-map';

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
  hasCreatePermission$ = this.store.select(selectHasPermission('organizations', Verb.Create));
  faUserGroup = faUserGroup;
  private showJoinDialogSubscription?: Subscription;
  organizationService: EntityCollectionService<Organization>;
  private loaded: boolean = false;

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private organizationServiceFactory: EntityCollectionServiceFactory
  ) {
    this.organizationService = organizationServiceFactory.create<Organization>(organizationEntityKey);
  }

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
    this.organizationService.getAll().subscribe(() => {
      this.loaded = true;
    });
  }

  openJoinOrganizationDialog(): void {
    this.dialogService.open(JoinOrganizationDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Organization`,
    });
  }

  isEmpty(): Observable<boolean> {
    if (this.loaded) {
      return this.organizationService.entities$.pipe(map((o) => o.length === 0));
    } else {
      return of(false);
    }
  }

  ngOnDestroy(): void {
    this.showJoinDialogSubscription?.unsubscribe();
  }
}
