import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Organization } from '../types/organization';
import { Entity, EntityState } from '../types/entity';
import { Observable } from 'rxjs';
import { selectOrganizations } from './store/organization.selectors';
import { faAdd, faEdit, faInfoCircle, faSitemap, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { selectHasPermission } from '../store/app.selectors';
import { Verb } from '../store/app.reducer';
import { DialogService } from 'primeng/dynamicdialog';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent {
  organizations$: Observable<Entity<Organization[]>> = this.store.select(selectOrganizations);
  faInfo = faInfoCircle;
  faWarning = faWarning;
  faEdit = faEdit;
  faAdd = faAdd;
  faSitemap = faSitemap;
  hasCreatePermission$ = this.store.select(selectHasPermission('organizations', Verb.Create));
  faUserGroup = faUserGroup;

  constructor(private store: Store, private dialogService: DialogService) {}

  isLoading(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Loading;
  }

  isListEmpty(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Loaded && zones.value.length === 0;
  }

  hasLoadingFailed(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Failed;
  }

  openJoinOrganizationDialog(): void {
    this.dialogService.open(JoinOrganizationDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Organization`,
    });
  }
}
