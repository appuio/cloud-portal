import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { invitationEntityKey } from './entity-metadata-map';
import { Invitation } from '../types/invitation';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { apiPrefix } from './kubernetes-url-generator.service';

@Injectable({
  providedIn: 'root',
})
export class InvitationCollectionService extends KubernetesCollectionService<Invitation> {
  constructor(elementsFactory: EntityCollectionServiceElementsFactory, private http: HttpClient) {
    super(invitationEntityKey, elementsFactory);
  }

  redeemInvitation(invitation: Invitation): Observable<Invitation> {
    return this.http
      .request<Invitation>(
        'REDEEM', // yes, a special HTTP method, see https://kb.vshn.ch/appuio-cloud/references/architecture/control-api-invitation.html#_accepting_an_invitation
        `${apiPrefix}/apis/${invitation.apiVersion}/invitations/${invitation.metadata.name}/${invitation.status?.token}`,
        {
          body: invitation,
          responseType: 'json',
        }
      )
      .pipe(
        tap(() => {
          this.upsertOneInCache(invitation);
        })
      );
  }
}
