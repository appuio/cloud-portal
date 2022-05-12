import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectZoneByName } from 'src/app/store/app.selectors';

@Component({
  selector: 'app-single-zone',
  templateUrl: './single-zone.component.html',
  styleUrls: ['./single-zone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleZoneComponent {
  zone$ = this.store.select(selectZoneByName);

  constructor(private store: Store) {}
}
