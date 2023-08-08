import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityRoutingModule } from './billing-entity-routing.module';
import { BillingEntityDetailComponent } from './billingentity-detail/billing-entity-detail.component';
import { BillingEntityMembersComponent } from './billingentity-members/billing-entity-members.component';
import { BillingEntityViewComponent } from './billingentity-view/billing-entity-view.component';
import { BillingEntityFormComponent } from './billingentity-form/billing-entity-form.component';

@NgModule({
    imports: [SharedModule, BillingEntityRoutingModule, BillingEntityComponent,
        BillingEntityDetailComponent,
        BillingEntityMembersComponent,
        BillingEntityViewComponent,
        BillingEntityFormComponent],
})
export default class BillingEntityModule {}
