import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { BillingEntity } from '../../types/billing-entity';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billing-entity-view.component.html',
  styleUrls: ['./billing-entity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityViewComponent {
  @Input()
  billingEntity!: BillingEntity;

  faClose = faClose;
}
