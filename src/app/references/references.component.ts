import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReferencesService, Reference } from '../core/references.service';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencesComponent {
  references: Reference[];
  constructor(private refService: ReferencesService) {
    this.references = this.refService.getReferences();
  }
}
