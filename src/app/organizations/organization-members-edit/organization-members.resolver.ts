import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrganizationMembers } from '../../types/organization-members';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../../store/kubernetes-collection.service';
import { organizationMembersEntityKey } from '../../store/entity-metadata-map';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersResolver implements Resolve<OrganizationMembers | undefined> {
  private orgMembersCollectionService: KubernetesCollectionService<OrganizationMembers>;
  constructor(private kubernetesCollectionServiceFactory: KubernetesCollectionServiceFactory<OrganizationMembers>) {
    this.orgMembersCollectionService = kubernetesCollectionServiceFactory.create(organizationMembersEntityKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrganizationMembers | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.orgMembersCollectionService.getByKeyMemoized(`${name}/members`);
  }
}
