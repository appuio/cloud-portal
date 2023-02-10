import { Injectable } from '@angular/core';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';
import { composeSsarId } from '../store/entity-metadata-map';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from '../store/app.reducer';
import { OrganizationCollectionService } from './organization-collection.service';
import { Organization } from '../types/organization';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationPermissionService {
  constructor(
    private organizationCollectionService: OrganizationCollectionService,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {
    organizationCollectionService.entities$.subscribe((orgs) => {
      orgs.forEach((org) => {
        const editSsar = new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', org.metadata.name);
        const key = composeSsarId(editSsar);
        // TODO: Upon editing/adding an org, the Update permissions is check again for each organization.
        // Maybe only do this for SSAR not yet in entities$
        ssarCollectionService.getByKey(key);
      });
    });

    this.canAddOrganizations$ = this.ssarCollectionService.entities$.pipe(
      map((ssars) =>
        ssars.some((ssar) =>
          ssarCollectionService.isMatchingAndAllowed(ssar, 'rbac.appuio.io', 'organizations', '', Verb.Create)
        )
      )
    );
  }

  canAddOrganizations$: Observable<boolean>;

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
