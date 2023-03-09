import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { zoneEntityKey } from './entity-metadata-map';
import { Zone } from '../types/zone';

@Injectable({
  providedIn: 'root',
})
export class ZoneCollectionService extends KubernetesCollectionService<Zone> {
  constructor(private elementsFactory: EntityCollectionServiceElementsFactory) {
    super(zoneEntityKey, elementsFactory);
  }
}
