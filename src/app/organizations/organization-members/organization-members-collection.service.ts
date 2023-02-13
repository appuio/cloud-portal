import { Injectable } from '@angular/core';
import { EntityActionOptions, EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { SelfSubjectAccessReviewCollectionService } from '../../store/ssar-collection.service';
import { composeSsarId, organizationMembersEntityKey } from '../../store/entity-metadata-map';
import { OrganizationMembers } from '../../types/organization-members';
import { Observable, tap } from 'rxjs';
import { SelfSubjectAccessReview } from '../../types/self-subject-access-review';
import { Verb } from '../../store/app.reducer';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersCollectionService extends EntityCollectionServiceBase<OrganizationMembers> {
  constructor(
    private elementsFactory: EntityCollectionServiceElementsFactory,
    private ssarCollectionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(organizationMembersEntityKey, elementsFactory);
  }

  override getByKey(key: string, options?: EntityActionOptions): Observable<OrganizationMembers> {
    return super.getByKey(key, options).pipe(
      tap((members) => {
        const editSsar = new SelfSubjectAccessReview(
          Verb.Update,
          'organizationmembers',
          'rbac.appuio.io',
          members.metadata.namespace
        );
        const key = composeSsarId(editSsar);
        this.ssarCollectionService.getByKey(key);
      })
    );
  }
}
