import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { RoleBinding } from '../types/role-binding';
import { rolebindingEntityKey } from './entity-metadata-map';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';

@Injectable({
  providedIn: 'root',
})
export class RolebindingCollectionService extends KubernetesCollectionService<RoleBinding> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(rolebindingEntityKey, elementsFactory);
  }
}
