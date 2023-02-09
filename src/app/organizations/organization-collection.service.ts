import { Injectable } from '@angular/core';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { organizationEntityKey } from '../store/entity-metadata-map';
import { combineLatest, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends EntityCollectionServiceBase<Organization> {
  selected$: Subject<Organization> = new Subject<Organization>();

  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(organizationEntityKey, elementsFactory);
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
