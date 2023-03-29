import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingentityDetailComponent } from './billingentity-detail/billingentity-detail.component';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { BillingEntityPermissions } from '../types/billing-entity';
import { BillingentityMembersComponent } from './billingentity-members/billingentity-members.component';

const routes: Routes = [
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
    component: BillingentityDetailComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...BillingEntityPermissions, verb: 'list' }],
    },
  },
  {
    path: ':name/members',
    component: BillingentityMembersComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...BillingEntityPermissions, verb: 'list' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingEntityRoutingModule {}
