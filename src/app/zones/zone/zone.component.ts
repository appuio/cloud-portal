import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faClipboard, faCode, faList } from '@fortawesome/free-solid-svg-icons';
import { Zone } from 'src/app/types/zone';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneComponent {
  @Input() zone?: Zone;

  faCode = faCode;
  faList = faList;
  faClipboard = faClipboard;
  codeMode = false;

  switchToCodeMode(): void {
    this.codeMode = true;
  }

  switchToNoCodeMode(): void {
    this.codeMode = false;
  }
}
