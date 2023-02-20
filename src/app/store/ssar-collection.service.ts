import { Injectable } from '@angular/core';
import { EntityActionOptions, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import {
  newIdFromSelfSubjectAccessReview,
  newSelfSubjectAccessReview,
  SelfSubjectAccessReview,
} from '../types/self-subject-access-review';
import { map, Observable, of, take } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KubernetesCollectionService } from './kubernetes-collection.service';

@Injectable({
  providedIn: 'root',
})
export class SelfSubjectAccessReviewCollectionService extends KubernetesCollectionService<SelfSubjectAccessReview> {
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(selfSubjectAccessReviewEntityKey, elementsFactory);
  }

  public isAllowed(group: string, resource: string, verb: string, namespace?: string): Observable<boolean> {
    return this.getBySelfSubjectAccessReviewLazy(
      newSelfSubjectAccessReview(verb, resource, group, namespace ?? '')
    ).pipe(map((ssar) => ssar.status?.allowed ?? false));
  }

  public getBySelfSubjectAccessReviewLazy(
    ssarKey: SelfSubjectAccessReview,
    options?: EntityActionOptions
  ): Observable<SelfSubjectAccessReview> {
    const key = ssarKey.spec.resourceAttributes;
    return this.entities$.pipe(
      take(1),
      switchMap((ssars: SelfSubjectAccessReview[]) => {
        const ssar = ssars.find((ssar) => this.isMatching(ssar, key.group, key.resource, key.namespace, key.verb));
        if (ssar) {
          return of(ssar);
        }
        return super.getByKey(newIdFromSelfSubjectAccessReview(ssarKey), options);
      })
    );
  }

  public isMatching(
    ssar: SelfSubjectAccessReview,
    group: string,
    respource: string,
    namespace: string,
    verb: string
  ): boolean {
    const attr = ssar.spec.resourceAttributes;
    let isMatching: boolean =
      attr.verb === verb && attr.group === group && attr.resource === respource && attr.verb === verb;
    if (namespace !== '') {
      isMatching = isMatching && attr.namespace === namespace;
    }
    return isMatching;
  }
}
