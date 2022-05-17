import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faInfoCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { selectZoneByName } from 'src/app/store/app.selectors';
import { EntityState } from 'src/app/types/entity';

@Component({
  selector: 'app-single-zone',
  templateUrl: './single-zone.component.html',
  styleUrls: ['./single-zone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleZoneComponent {
  zone$ = this.store.select(selectZoneByName);
  faInfo = faInfoCircle;
  faWarning = faWarning;

  EntityState = EntityState;

  constructor(private store: Store) {}
}
