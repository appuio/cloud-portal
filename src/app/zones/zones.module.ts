import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonesComponent } from './zones.component';
import { ZoneComponent } from './zone/zone.component';
import { ZoneFeaturesPipe } from './zone-features.pipe';
import { ZonesRoutingModule } from './zones-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { Store } from '@ngrx/store';
import { loadZones } from '../store/app.actions';

@NgModule({
  declarations: [ZonesComponent, ZoneComponent, ZoneFeaturesPipe, SingleZoneComponent],
  imports: [CommonModule, SharedModule, ZonesRoutingModule],
})
export class ZonesModule {
  constructor(private store: Store) {
    store.dispatch(loadZones());
  }
}
