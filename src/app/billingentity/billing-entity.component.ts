import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BillingEntity } from '../types/billing-entity';

import { faEdit, faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';

@Component({
  selector: 'app-billing-entity',
  templateUrl: './billing-entity.component.html',
  styleUrls: ['./billing-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityComponent {
  faWarning = faWarning;
  faInfo = faInfo;
  faEdit = faEdit;
  billingEntities$: Observable<BillingEntity[]>;

  constructor(public billingEntityService: BillingEntityCollectionService) {
    this.billingEntities$ = this.billingEntityService.getAllMemoized();
  }
}
