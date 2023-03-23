import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { InvitationRedeemRequest } from '../types/invitation';
import { invitationRedeemRequestEntityKey } from './entity-metadata-map';

@Injectable({
  providedIn: 'root',
})
export class InvitationRedeemRequestCollectionService extends KubernetesCollectionService<InvitationRedeemRequest> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(invitationRedeemRequestEntityKey, elementsFactory);
  }

  newInvitationRedeemRequest(invName: string, token: string): InvitationRedeemRequest {
    return {
      apiVersion: 'user.appuio.io/v1',
      kind: 'InvitationRedeemRequest',
      metadata: {
        name: invName,
      },
      token: token,
    };
  }
}
