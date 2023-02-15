import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EntityCollectionService, EntityCollectionServiceFactory } from '@ngrx/data';
import { BillingEntity } from '../types/billing-entity';
import { billingEntityEntityKey } from '../store/entity-metadata-map';

@Component({
  selector: 'app-billing-entity',
  templateUrl: './billing-entity.component.html',
  styleUrls: ['./billing-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityComponent implements OnInit {
  billingEntityService: EntityCollectionService<BillingEntity>;
  constructor(private factory: EntityCollectionServiceFactory) {
    this.billingEntityService = factory.create<BillingEntity>(billingEntityEntityKey);
  }

  ngOnInit(): void {
    this.billingEntityService.getByKey('be-2345').subscribe();
  }
}
