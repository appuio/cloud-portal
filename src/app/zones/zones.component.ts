import {ChangeDetectionStrategy, Component} from '@angular/core';
import {faClipboard, faCode, faInfoCircle, faList} from '@fortawesome/free-solid-svg-icons';
import {selectZones} from "../store/app.selectors";
import {Store} from "@ngrx/store";
import {loadZones} from "../store/app.actions";

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZonesComponent {

  zones$ = this.store.select(selectZones);
  faCode = faCode;
  faList = faList;
  faClipboard = faClipboard;
  codeMode: {[key: string]: boolean} = {};
  faInfo = faInfoCircle;

  constructor(private store: Store) {
    store.dispatch(loadZones());
  }

  switchToCodeMode(i: number): void {
    this.codeMode[i] = true;
  }

  switchToNoCodeMode(i: number): void {
    this.codeMode[i] = false;
  }
}
