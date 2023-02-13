import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Organization } from '../../types/organization';
import { map, Observable, of } from 'rxjs';
import { OrganizationCollectionService } from '../organization-collection.service';
import { Injectable } from '@angular/core';
import { organizationNameFilter } from '../../store/entity-filter';

@Injectable({ providedIn: 'root' })
export class OrganizationResolver implements Resolve<Organization | undefined> {
  constructor(private organizationService: OrganizationCollectionService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Organization | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.organizationService.entities$.pipe(map((orgs) => orgs.find(organizationNameFilter(name))));
  }
}
