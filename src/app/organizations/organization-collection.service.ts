import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { organizationEntityKey } from '../store/entity-metadata-map';
import { combineLatest, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends EntityCollectionServiceBase<Organization> {
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(organizationEntityKey, elementsFactory);
  }

  isEmptyAndLoaded(): Observable<boolean> {
    return combineLatest([this.loading$, this.entities$], (loading, entities) => {
      if (loading) {
        return false;
      }
      return entities.length === 0;
    });
  }
}
