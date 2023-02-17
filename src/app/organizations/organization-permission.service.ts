import { Injectable } from '@angular/core';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';
import { Verb } from '../store/app.reducer';
import { Organization } from '../types/organization';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationPermissionService {
  constructor(private ssarCollectionService: SelfSubjectAccessReviewCollectionService) {
    this.canAddOrganizations$ = this.ssarCollectionService.entities$.pipe(
      map((ssars) =>
        ssars.some((ssar) =>
          ssarCollectionService.isMatchingAndAllowed(ssar, 'rbac.appuio.io', 'organizations', '', Verb.Create)
        )
      )
    );
  }

  canAddOrganizations$: Observable<boolean>;
  canViewMembers(org: Organization): Observable<boolean> {
    return this.ssarCollectionService.entities$.pipe(
      map((ssars) =>
        ssars.some((ssar) =>
          this.ssarCollectionService.isMatchingAndAllowed(
            ssar,
            'appuio.io',
            'organizationmembers',
            org.metadata.name,
            Verb.List
          )
        )
      )
    );
  }

  canEditOrganization(org: Organization): Observable<boolean> {
    return this.ssarCollectionService.entities$.pipe(
      map((ssars) =>
        ssars.some((ssar) =>
          this.ssarCollectionService.isMatchingAndAllowed(
            ssar,
            'rbac.appuio.io',
            'organizations',
            org.metadata.name,
            Verb.Update
          )
        )
      )
    );
  }
}
