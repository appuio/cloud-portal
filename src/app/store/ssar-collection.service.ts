import { Injectable } from '@angular/core';
import { EntityActionOptions, EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { composeSsarId, selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { map, Observable, of, take } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SelfSubjectAccessReviewCollectionService extends EntityCollectionServiceBase<SelfSubjectAccessReview> {
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(selfSubjectAccessReviewEntityKey, elementsFactory);
  }

  public isAllowed(group: string, resource: string, verb: string, namespace?: string): Observable<boolean> {
    return this.getBySelfSubjectAccessReviewLazy(
      new SelfSubjectAccessReview(verb, resource, group, namespace ?? '')
    ).pipe(map((ssar) => ssar.status.allowed));
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
        return super.getByKey(composeSsarId(ssarKey), options);
      })
    );
  }

  public isMatchingAndAllowed(
    ssar: SelfSubjectAccessReview,
    group: string,
    respource: string,
    namespace: string,
    verb: string
  ): boolean {
    const isMatching = this.isMatching(ssar, group, respource, namespace, verb);
    return isMatching ? ssar.status.allowed : false;
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

  getBySelfSubjectAccessReview(ssar: SelfSubjectAccessReview): Observable<SelfSubjectAccessReview> {
    const key = composeSsarId(ssar);
    return super.getByKey(key);
  }
}
