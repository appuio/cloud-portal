import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { Observable } from 'rxjs';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { organizationEntityKey } from './entity-metadata-map';
import { Verb } from './app.reducer';
import { OrganizationMembers } from '../types/organization-members';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersCollectionService extends KubernetesCollectionService<OrganizationMembers> {
  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationEntityKey, elementsFactory);
  }

  canViewMembers(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed('appuio.io', 'organizationmembers', Verb.List, namespace);
  }
}
