import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { BillingEntity } from '../../types/billing-entity';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billing-entity-view.component.html',
  styleUrls: ['./billing-entity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor],
})
export class BillingEntityViewComponent {
  @Input({ required: true })
  billingEntity!: BillingEntity;

  faClose = faClose;
}
