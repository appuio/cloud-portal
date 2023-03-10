import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { ClusterRole } from '../types/clusterRole';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { clusterroleEntityKey } from './entity-metadata-map';

@Injectable({
  providedIn: 'root',
})
export class ClusterRoleCollectionService extends KubernetesCollectionService<ClusterRole> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(clusterroleEntityKey, elementsFactory);
  }
}
