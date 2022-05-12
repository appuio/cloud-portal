import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonesComponent } from './zones.component';
import { ZoneComponent } from './zone/zone.component';
import { ZoneFeaturesPipe } from './zone-features.pipe';
import { ZonesRoutingModule } from './zones-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ZonesComponent, ZoneComponent, ZoneFeaturesPipe],
  imports: [CommonModule, SharedModule, ZonesRoutingModule],
})
export class ZonesModule {}
