import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { composeSsarId, selfSubjectAccessReviewEntityKey } from './entity-metadata-map';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelfSubjectAccessReviewCollectionService extends EntityCollectionServiceBase<SelfSubjectAccessReview> {
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(selfSubjectAccessReviewEntityKey, elementsFactory);
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
