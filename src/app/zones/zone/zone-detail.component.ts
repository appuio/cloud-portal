import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { faClipboard, faClose, faCode, faList } from '@fortawesome/free-solid-svg-icons';
import { AppConfigService } from 'src/app/app-config.service';
import { Zone } from 'src/app/types/zone';
import { ZoneUrlLabelPipe } from '../zone-url-label.pipe';
import { ZoneFeaturesPipe } from '../zone-features.pipe';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TagModule } from 'primeng/tag';
import { BackLinkDirective } from '../../shared/back-link.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, JsonPipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-zone-detail',
  templateUrl: './zone-detail.component.html',
  styleUrls: ['./zone-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    ButtonModule,
    FontAwesomeModule,
    BackLinkDirective,
    NgFor,
    TagModule,
    ClipboardModule,
    JsonPipe,
    KeyValuePipe,
    ZoneFeaturesPipe,
    ZoneUrlLabelPipe,
  ],
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

  consoleUrlKey;

  constructor(private appConfigService: AppConfigService) {
    this.consoleUrlKey = this.appConfigService.getConfiguration()?.zones?.consoleUrlKey || 'console';
  }

  switchToCodeMode(): void {
    this.codeMode = true;
  }

  switchToNoCodeMode(): void {
    this.codeMode = false;
  }
}
