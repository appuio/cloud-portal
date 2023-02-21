import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { Observable } from 'rxjs';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { organizationMembersEntityKey } from './entity-metadata-map';
import { Verb } from './app.reducer';
import { OrganizationMembers, OrganizationMembersPermissions } from '../types/organization-members';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersCollectionService extends KubernetesCollectionService<OrganizationMembers> {
  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationMembersEntityKey, elementsFactory);
  }

  canViewMembers(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed(
      OrganizationMembersPermissions.group,
      OrganizationMembersPermissions.resource,
      Verb.List,
      namespace
    );
  }
  canEditMembers(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed(
      OrganizationMembersPermissions.group,
      OrganizationMembersPermissions.resource,
      Verb.Update,
      namespace
    );
  }
}
