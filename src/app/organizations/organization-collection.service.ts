import { Injectable } from '@angular/core';
import { EntityActionOptions, EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { composeSsarId, organizationEntityKey } from '../store/entity-metadata-map';
import { combineLatest, Observable, tap } from 'rxjs';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from '../store/app.reducer';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends EntityCollectionServiceBase<Organization> {
  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationEntityKey, elementsFactory);
  }

  override getAll(options?: EntityActionOptions): Observable<Organization[]> {
    return super.getAll(options).pipe(
      tap((orgs) => {
        return orgs.forEach((org) => {
          const editSsar = new SelfSubjectAccessReview(
            Verb.Update,
            'organizations',
            'rbac.appuio.io',
            org.metadata.name
          );
          const key = composeSsarId(editSsar);
          this.ssarCollectionService.getByKey(key);
        });
      })
    );
  }

  override add(
    entity: Organization,
    options?: EntityActionOptions & { isOptimistic: false }
  ): Observable<Organization> {
    return super.add(entity, options).pipe(
      tap((org) => {
        // theoretically, we could just add the SSAR to the cache with addOneToCache,
        //  but just because we could create an organization, doesn't strictly mean we can also edit it.
        const editSsar = new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', org.metadata.name);
        const key = composeSsarId(editSsar);
        this.ssarCollectionService.getByKey(key);
      })
    );
  }

  isEmptyAndLoaded(): Observable<boolean> {
    return combineLatest([this.loaded$, this.entities$], (loaded, entities) => {
      if (loaded) {
        return entities.length === 0;
      }
      return false;
    });
  }
}
