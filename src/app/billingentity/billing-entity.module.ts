import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityRoutingModule } from './billing-entity-routing.module';
import { BillingentityViewComponent } from './billingentity-view/billingentity-view.component';
import { PanelModule } from 'primeng/panel';

@NgModule({
  declarations: [BillingEntityComponent, BillingentityViewComponent],
  imports: [SharedModule, BillingEntityRoutingModule, PanelModule],
})
export default class BillingEntityModule {}
