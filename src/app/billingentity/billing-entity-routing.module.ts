import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingEntityComponent } from './billing-entity.component';

const routes: Routes = [
  {
    path: '',
    component: BillingEntityComponent,
    //canActivate: [PermissionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingEntityRoutingModule {}
