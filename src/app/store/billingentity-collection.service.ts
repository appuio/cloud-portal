import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { billingEntityEntityKey } from './entity-metadata-map';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BillingEntity } from '../types/billing-entity';
import { Observable } from 'rxjs';
import { Verb } from './app.reducer';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { ClusterRoleBindingPermissions } from '../types/clusterrole-binding';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityCollectionService extends KubernetesCollectionService<BillingEntity> {
  constructor(
    elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(billingEntityEntityKey, elementsFactory);
  }

  canViewMembers(clusterRoleBindingName: string): Observable<boolean> {
    return this.permissionService.isAllowed(
      ClusterRoleBindingPermissions.group,
      ClusterRoleBindingPermissions.resource,
      Verb.Get,
      undefined,
      clusterRoleBindingName
    );
  }
  canEditMembers(clusterRoleBindingName: string): Observable<boolean> {
    return this.permissionService.isAllowed(
      ClusterRoleBindingPermissions.group,
      ClusterRoleBindingPermissions.resource,
      Verb.Update,
      undefined,
      clusterRoleBindingName
    );
  }
}
