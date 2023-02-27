import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';
import { BillingEntityResolver } from './billingentity-view/billing-entity-resolver.service';
import { BillingEntityGuard } from './billing-entity.guard';

const routes: Routes = [
  {
    path: '',
    component: BillingEntityComponent,
    canActivate: [BillingEntityGuard],
  },
  {
    path: ':name',
    component: BillingentityViewComponent,
    resolve: {
      billingEntity: BillingEntityResolver,
    },
    canActivate: [BillingEntityGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingEntityRoutingModule {}
