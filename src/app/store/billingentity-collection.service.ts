import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { billingEntityEntityKey } from './entity-metadata-map';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BillingEntity } from '../types/billing-entity';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityCollectionService extends KubernetesCollectionService<BillingEntity> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(billingEntityEntityKey, elementsFactory);
  }
}
