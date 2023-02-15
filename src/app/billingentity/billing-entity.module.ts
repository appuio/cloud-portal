import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { BillingEntityComponent } from './billing-entity.component';
import { BillingEntityRoutingModule } from './billing-entity-routing.module';

@NgModule({
  declarations: [BillingEntityComponent],
  imports: [SharedModule, BillingEntityRoutingModule],
})
export default class BillingEntityModule {}
