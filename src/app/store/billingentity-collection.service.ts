import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { billingEntityEntityKey } from './entity-metadata-map';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BillingEntity, BillingEntityPermissions } from '../types/billing-entity';
import { SelfSubjectAccessReviewCollectionService } from './ssar-collection.service';
import { Verb } from './app.reducer';
import { Observable } from 'rxjs';
import { ClusterRoleBindingPermissions } from '../types/clusterrole-binding';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityCollectionService extends KubernetesCollectionService<BillingEntity> {
  canViewBillingEntities$: Observable<boolean>;

  constructor(
    elementsFactory: EntityCollectionServiceElementsFactory,
    private permissionService: SelfSubjectAccessReviewCollectionService
  ) {
    super(billingEntityEntityKey, elementsFactory);

    this.canViewBillingEntities$ = permissionService.isAllowed(
      BillingEntityPermissions.group,
      BillingEntityPermissions.resource,
      Verb.List
    );
  }

  canViewBilling(name: string): Observable<boolean> {
    return this.permissionService.isAllowed(
      BillingEntityPermissions.group,
      BillingEntityPermissions.resource,
      Verb.Get,
      undefined,
      name
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
