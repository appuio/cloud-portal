import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityRoutingModule } from './billing-entity-routing.module';
import { BillingentityDetailComponent } from './billingentity-detail/billingentity-detail.component';
import { PanelModule } from 'primeng/panel';
import { BillingentityMembersComponent } from './billingentity-members/billingentity-members.component';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';

@NgModule({
  declarations: [
    BillingEntityComponent,
    BillingentityDetailComponent,
    BillingentityMembersComponent,
    BillingentityViewComponent,
  ],
  imports: [SharedModule, BillingEntityRoutingModule, PanelModule],
})
export default class BillingEntityModule {}
