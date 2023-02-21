import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { BillingEntityPermissions } from '../types/billing-entity';

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
    component: BillingentityViewComponent,
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
