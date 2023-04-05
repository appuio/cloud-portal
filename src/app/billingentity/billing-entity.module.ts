import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityRoutingModule } from './billing-entity-routing.module';
import { BillingentityDetailComponent } from './billingentity-detail/billingentity-detail.component';
import { BillingentityMembersComponent } from './billingentity-members/billingentity-members.component';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';
import { BillingentityFormComponent } from './billingentity-form/billingentity-form.component';

@NgModule({
  declarations: [
    BillingEntityComponent,
    BillingentityDetailComponent,
    BillingentityMembersComponent,
    BillingentityViewComponent,
    BillingentityFormComponent,
  ],
  imports: [SharedModule, BillingEntityRoutingModule],
})
export default class BillingEntityModule {}
