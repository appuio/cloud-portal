import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EntityCollectionService, EntityCollectionServiceFactory, EntityOp } from '@ngrx/data';
import { BillingEntity } from '../types/billing-entity';
import { billingEntityEntityKey } from '../store/entity-metadata-map';

import { faEdit, faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { filter, map, Observable } from 'rxjs';

@Component({
  selector: 'app-billing-entity',
  templateUrl: './billing-entity.component.html',
  styleUrls: ['./billing-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityComponent implements OnInit {
  billingEntityService: EntityCollectionService<BillingEntity>;

  faWarning = faWarning;
  faInfo = faInfo;
  faEdit = faEdit;

  constructor(private factory: EntityCollectionServiceFactory) {
    this.billingEntityService = factory.create<BillingEntity>(billingEntityEntityKey);
  }

  ngOnInit(): void {
    this.billingEntityService.getAll().subscribe(); // initial load to cache
  }

  loadErrors(): Observable<Error> {
    return this.billingEntityService.errors$.pipe(
      filter((action) => {
        return action.payload.entityOp == EntityOp.QUERY_ALL_ERROR;
      }),
      map((action) => {
        return action.payload.data.error.error satisfies Error;
      })
    );
  }
}
