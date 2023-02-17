import { Injectable } from '@angular/core';
import { EntityActionOptions, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { organizationEntityKey } from './entity-metadata-map';
import { combineLatest, Observable, tap } from 'rxjs';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Verb } from './app.reducer';
import { KubernetesCollectionService } from './kubernetes-collection.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends KubernetesCollectionService<Organization> {
  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationEntityKey, elementsFactory);
  }

  override getAll(options?: EntityActionOptions): Observable<Organization[]> {
    return super.getAll(options).pipe(
      tap((orgs) =>
        orgs.forEach((org) => {
          this.ssarCollectionService.getBySelfSubjectAccessReview(
            new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', org.metadata.name)
          );
          this.ssarCollectionService.getBySelfSubjectAccessReview(
            new SelfSubjectAccessReview(Verb.List, 'organizationmembers', 'appuio.io', org.metadata.name)
          );
        })
      )
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
        this.ssarCollectionService.getBySelfSubjectAccessReview(
          new SelfSubjectAccessReview(Verb.Update, 'organizations', 'rbac.appuio.io', org.metadata.name)
        );
        this.ssarCollectionService.getBySelfSubjectAccessReview(
          new SelfSubjectAccessReview(Verb.List, 'organizationmembers', 'appuio.io', org.metadata.name)
        );
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