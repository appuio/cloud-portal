import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization, OrganizationPermissions } from '../types/organization';
import { organizationEntityKey } from './entity-metadata-map';
import { filter, forkJoin, map, Observable } from 'rxjs';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { Verb } from './app.reducer';
import { BillingEntityPermissions } from '../types/billing-entity';
import { metadataNameFilter } from './entity-filter';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends KubernetesCollectionService<Organization> {
  canAddOrganizations$: Observable<boolean>;
  canViewOrganizations$: Observable<boolean>;
  selectedOrganization$: Observable<Organization>;

  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationEntityKey, elementsFactory);

    this.canAddOrganizations$ = permissionService.isAllowed(
      OrganizationPermissions.group,
      OrganizationPermissions.resource,
      Verb.Create
    );

    this.canViewOrganizations$ = permissionService.isAllowed(
      OrganizationPermissions.group,
      OrganizationPermissions.resource,
      Verb.List
    );

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
