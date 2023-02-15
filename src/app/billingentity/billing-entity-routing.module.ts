import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';
import { BillingEntityResolver } from './billingentity-view/billing-entity-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: BillingEntityComponent,
    //canActivate: [PermissionGuard],
  },
  {
    path: ':name',
    component: BillingentityViewComponent,
    resolve: {
      billingEntity: BillingEntityResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingEntityRoutingModule {}
