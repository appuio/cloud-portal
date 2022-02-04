import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Organization } from '../types/organization';
import { Entity, EntityState } from '../types/entity';
import { Observable } from 'rxjs';
import { selectOrganizations } from './store/organization.selectors';
import { faAdd, faEdit, faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { selectHasPermission } from '../store/app.selectors';

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
  hasUpdatePermission$ = this.store.select(selectHasPermission('organizations', 'update'));
  hasCreatePermission$ = this.store.select(selectHasPermission('organizations', 'create'));

  constructor(private store: Store) {}

  isLoading(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Loading;
  }

  isListEmpty(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Loaded && zones.value.length === 0;
  }

  hasLoadingFailed(zones: Entity<Organization[]>): boolean {
    return zones.state === EntityState.Failed;
  }
}
