import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Organization } from '../types/organization';
import { organizationEntityKey } from './entity-metadata-map';
import { combineLatest, Observable } from 'rxjs';
import { KubernetesCollectionService } from './kubernetes-collection.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationCollectionService extends KubernetesCollectionService<Organization> {
  isEmptyAndLoaded$: Observable<boolean>;
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(organizationEntityKey, elementsFactory);
    this.isEmptyAndLoaded$ = combineLatest([this.loaded$, this.entities$], (loaded, entities) => {
      if (loaded) {
        return entities.length === 0;
      }
      return false;
    });
  }
}
