import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { Team, TeamPermissions } from '../types/team';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { teamEntityKey } from './entity-metadata-map';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { Verb } from './app.reducer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamCollectionService extends KubernetesCollectionService<Team> {
  constructor(
    elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(teamEntityKey, elementsFactory);
  }

  canCreate(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed(TeamPermissions.group, TeamPermissions.resource, Verb.Create, namespace);
  }

  canEdit(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed(TeamPermissions.group, TeamPermissions.resource, Verb.Update, namespace);
  }
  canDelete(namespace: string): Observable<boolean> {
    return this.permissionService.isAllowed(TeamPermissions.group, TeamPermissions.resource, Verb.Delete, namespace);
  }
}
