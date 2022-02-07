import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectIsNewOrganization, selectOrganization } from '../store/organization.selectors';
import { Observable } from 'rxjs';
import { Organization } from '../../types/organization';
import { faClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationEditComponent {
  organization$: Observable<Organization | undefined> = this.store.select(selectOrganization);
  isNew$ = this.store.select(selectIsNewOrganization);
  faClose = faClose;

  constructor(private store: Store) {}
}
