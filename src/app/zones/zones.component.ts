import { ChangeDetectionStrategy, Component } from '@angular/core';
import { faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { selectZones } from '../store/app.selectors';
import { Store } from '@ngrx/store';
import { Zone } from '../types/zone';
import { Entity, EntityState } from '../types/entity';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonesComponent {
  zones$ = this.store.select(selectZones);

  faInfo = faInfoCircle;
  faWarning = faWarning;

  constructor(private store: Store) {}

  isZoneListEmpty(zones: Entity<Zone[]>): boolean {
    return zones.state === EntityState.Loaded && zones.value.length === 0;
  }

  hasZoneLoadingFailed(zones: Entity<Zone[]>): boolean {
    return zones.state === EntityState.Failed;
  }
}
