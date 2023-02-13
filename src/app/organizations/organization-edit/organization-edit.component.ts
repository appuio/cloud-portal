import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { newOrganization, Organization } from '../../types/organization';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { OrganizationCollectionService } from '../organization-collection.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { organizationNameFilter } from '../../store/entity-filter';

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationEditComponent {
  organization$: Observable<Organization>;
  isNew$: Observable<boolean>;
  faClose = faClose;

  constructor(
    private store: Store,
    private organizationCollectionService: OrganizationCollectionService,
    private activatedRoute: ActivatedRoute
  ) {
    const name = this.activatedRoute.snapshot.paramMap.get('name') ?? '';
    this.organizationCollectionService.setFilter(organizationNameFilter(name));
    this.organization$ = this.organizationCollectionService.filteredEntities$.pipe(
      map((orgs) => {
        if (orgs.length === 0) {
          return newOrganization('', '');
        }
        return orgs[0];
      })
    );
    this.isNew$ = this.organizationCollectionService.filteredEntities$.pipe(map((orgs) => orgs.length === 0));
  }
}
