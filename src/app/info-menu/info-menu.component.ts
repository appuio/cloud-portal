import { Component, ChangeDetectionStrategy } from '@angular/core';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Reference, ReferencesService } from '../core/references.service';

@Component({
  selector: 'app-info-menu',
  templateUrl: './info-menu.component.html',
  styleUrls: ['./info-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoMenuComponent {
  references: Reference[];

  faQuestion = faQuestionCircle;

  constructor(private refService: ReferencesService) {
    this.references = refService.getReferences();
  }
}
