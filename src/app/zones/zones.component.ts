import { ChangeDetectionStrategy, Component } from '@angular/core';
import { faClipboard, faCode, faInfoCircle, faList, faWarning } from '@fortawesome/free-solid-svg-icons';
import { selectZones } from '../store/app.selectors';
import { Store } from '@ngrx/store';
import { loadZones } from '../store/app.actions';
import { Zone } from '../types/zone';
import { Entity, EntityState } from '../types/entity';
import { AppConfigService } from '../app-config.service';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZonesComponent {
  zones$ = this.store.select(selectZones);
  faCode = faCode;
  faList = faList;
  faClipboard = faClipboard;
  codeMode: { [key: string]: boolean } = {};
  faInfo = faInfoCircle;
  faWarning = faWarning;
  zones = this.appConfigService.getConfiguration().zones;

  constructor(private store: Store, private appConfigService: AppConfigService) {
    store.dispatch(loadZones());
  }

  switchToCodeMode(i: number): void {
    this.codeMode[i] = true;
  }

  switchToNoCodeMode(i: number): void {
    this.codeMode[i] = false;
  }

  isZoneListEmpty(zones: Entity<Zone[]>): boolean {
    return zones.state === EntityState.Loaded && zones.value.length === 0;
  }

  hasZoneLoadingFailed(zones: Entity<Zone[]>): boolean {
    return zones.state === EntityState.Failed;
  }
}
