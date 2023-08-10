import { Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityDetailComponent } from './billingentity-detail/billing-entity-detail.component';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { BillingEntityPermissions } from '../types/billing-entity';
import { BillingEntityMembersComponent } from './billingentity-members/billing-entity-members.component';

export const routes: Routes = [
  {
    path: '',
    component: BillingEntityComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...BillingEntityPermissions, verb: 'list' }],
    },
  },
  {
    path: ':name',
    component: BillingEntityDetailComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...BillingEntityPermissions, verb: 'list' }],
    },
  },
  {
    path: ':name/members',
    component: BillingEntityMembersComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...BillingEntityPermissions, verb: 'list' }],
    },
  },
];
