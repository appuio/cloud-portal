import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EntityOp } from '@ngrx/data';
import { BillingEntity } from '../types/billing-entity';
import { billingEntityEntityKey } from '../store/entity-metadata-map';

import { faEdit, faInfo, faWarning } from '@fortawesome/free-solid-svg-icons';
import { filter, map, Observable } from 'rxjs';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../store/kubernetes-collection.service';

@Component({
  selector: 'app-billing-entity',
  templateUrl: './billing-entity.component.html',
  styleUrls: ['./billing-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityComponent {
  billingEntityService: KubernetesCollectionService<BillingEntity>;

  faWarning = faWarning;
  faInfo = faInfo;
  faEdit = faEdit;
  billingEntities$: Observable<BillingEntity[]>;

  constructor(private factory: KubernetesCollectionServiceFactory<BillingEntity>) {
    this.billingEntityService = factory.create(billingEntityEntityKey);
    this.billingEntities$ = this.billingEntityService.getAllMemoized();
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
