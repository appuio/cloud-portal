import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { clusterrolebindingEntityKey } from './entity-metadata-map';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { ClusterRoleBinding } from '../types/clusterrole-binding';

@Injectable({
  providedIn: 'root',
})
export class ClusterRolebindingCollectionService extends KubernetesCollectionService<ClusterRoleBinding> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(clusterrolebindingEntityKey, elementsFactory);
  }
}
