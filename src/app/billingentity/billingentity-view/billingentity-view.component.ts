import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { BillingEntity } from '../../types/billing-entity';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billingentity-view.component.html',
  styleUrls: ['./billingentity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityViewComponent {
  @Input()
  billingEntity!: BillingEntity;

  faClose = faClose;
}
