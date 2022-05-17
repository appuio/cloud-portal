import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faClipboard, faClose, faCode, faList } from '@fortawesome/free-solid-svg-icons';
import { Zone } from 'src/app/types/zone';

@Component({
  selector: 'app-zone',
  templateUrl: './zone-detail.component.html',
  styleUrls: ['./zone-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoneDetailComponent {
  @Input() zone?: Zone;
  @Input() linkToDetailView = false;
  @Input() showCloseIcon = true;

  faCode = faCode;
  faList = faList;
  faClipboard = faClipboard;
  faClose = faClose;
  codeMode = false;

  switchToCodeMode(): void {
    this.codeMode = true;
  }

  switchToNoCodeMode(): void {
    this.codeMode = false;
  }
}
