import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrganizationMembers } from '../../types/organization-members';
import { OrganizationMembersCollectionService } from '../organization-members/organization-members-collection.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersResolver implements Resolve<OrganizationMembers | undefined> {
  constructor(private orgMembersCollectionService: OrganizationMembersCollectionService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrganizationMembers | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.orgMembersCollectionService.getByKey(name);
  }
}
