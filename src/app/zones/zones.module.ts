import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ZonesComponent } from './zones.component';
import { ZoneDetailComponent } from './zone/zone-detail.component';
import { ZoneFeaturesPipe } from './zone-features.pipe';
import { ZonesRoutingModule } from './zones-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { ZoneUrlLabelPipe } from './zone-url-label.pipe';

@NgModule({
  declarations: [ZonesComponent, ZoneDetailComponent, ZoneFeaturesPipe, SingleZoneComponent, ZoneUrlLabelPipe],
  imports: [CommonModule, SharedModule, ZonesRoutingModule],
  providers: [TitleCasePipe],
})
export default class ZonesModule {}
