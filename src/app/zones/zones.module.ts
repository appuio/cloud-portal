import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonesComponent } from './zones.component';
import { ZoneDetailComponent } from './zone/zone-detail.component';
import { ZoneFeaturesPipe } from './zone-features.pipe';
import { ZonesRoutingModule } from './zones-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { Store } from '@ngrx/store';
import { loadZones } from '../store/app.actions';

@NgModule({
  declarations: [ZonesComponent, ZoneDetailComponent, ZoneFeaturesPipe, SingleZoneComponent],
  imports: [CommonModule, SharedModule, ZonesRoutingModule],
})
export class ZonesModule {
  constructor(private store: Store) {
    this.store.dispatch(loadZones());
  }
}
