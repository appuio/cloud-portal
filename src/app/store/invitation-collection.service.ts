import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { invitationEntityKey } from './entity-metadata-map';
import { Invitation, InvitationPermissions } from '../types/invitation';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { Verb } from './app.reducer';

@Injectable({
  providedIn: 'root',
})
export class InvitationCollectionService extends KubernetesCollectionService<Invitation> {
  canInviteUsers$: Observable<boolean>;

  constructor(
    elementsFactory: EntityCollectionServiceElementsFactory,
    private http: HttpClient,
    permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(invitationEntityKey, elementsFactory);
    this.canInviteUsers$ = permissionService.isAllowed(
      InvitationPermissions.group,
      InvitationPermissions.resource,
      Verb.Create
    );
  }
}
