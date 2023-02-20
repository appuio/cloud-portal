import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Organization } from '../../types/organization';
import { Observable, of } from 'rxjs';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrganizationResolver implements Resolve<Organization | undefined> {
  constructor(private organizationService: OrganizationCollectionService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Organization | undefined> {
    const name = route.paramMap.get('name');
    if (!name || name === '$new') {
      return of(undefined);
    }
    return this.organizationService.getByKeyMemoized(name);
  }
}
