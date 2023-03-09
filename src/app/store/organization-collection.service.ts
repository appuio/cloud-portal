import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization, OrganizationPermissions } from '../types/organization';
import { organizationEntityKey } from './entity-metadata-map';
import { combineLatest, filter, forkJoin, map, Observable } from 'rxjs';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { Verb } from './app.reducer';
import { BillingEntityPermissions } from '../types/billing-entity';
import { metadataNameFilter } from './entity-filter';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends KubernetesCollectionService<Organization> {
  isEmptyAndLoaded$: Observable<boolean>;
  canAddOrganizations$: Observable<boolean>;
  selectedOrganization$: Observable<Organization>;

  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationEntityKey, elementsFactory);
    this.isEmptyAndLoaded$ = combineLatest([this.loaded$, this.entities$], (loaded, entities) => {
      if (loaded) {
        return entities.length === 0;
      }
      return false;
    });

    this.canAddOrganizations$ = forkJoin([
      permissionService.isAllowed(OrganizationPermissions.group, OrganizationPermissions.resource, Verb.Create),
      permissionService.isAllowed(BillingEntityPermissions.group, BillingEntityPermissions.resource, Verb.List),
    ]).pipe(map(([orgCreateAllowed, beListAllowed]) => orgCreateAllowed && beListAllowed));

    this.selectedOrganization$ = this.filteredEntities$.pipe(
      filter((org) => org.length > 0),
      map((orgs) => orgs[0])
    );
  }

  canEditOrganization(org: Organization): Observable<boolean> {
    return forkJoin([
      this.permissionService.isAllowed(
        OrganizationPermissions.group,
        OrganizationPermissions.resource,
        Verb.Update,
        org.metadata.name
      ),
      this.permissionService.isAllowed(BillingEntityPermissions.group, BillingEntityPermissions.resource, Verb.List),
    ]).pipe(map(([orgEditAllowed, beListAllowed]) => orgEditAllowed && beListAllowed));
  }

  selectOrganization(orgName: string): void {
    this.setFilter(metadataNameFilter(orgName));
  }
}
