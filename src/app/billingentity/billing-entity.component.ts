import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BillingEntity } from '../types/billing-entity';

import { faEdit, faInfo, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { map, Observable } from 'rxjs';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';

interface Payload {
  billingEntity: BillingEntity;
  canViewMembers$: Observable<boolean>;
}

@Component({
  selector: 'app-billing-entity',
  templateUrl: './billing-entity.component.html',
  styleUrls: ['./billing-entity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityComponent implements OnInit {
  faWarning = faWarning;
  faInfo = faInfo;
  faEdit = faEdit;
  faUserGroup = faUserGroup;
  payload$?: Observable<Payload[]>;

  constructor(public billingEntityService: BillingEntityCollectionService) {}
  ngOnInit(): void {
    this.payload$ = this.billingEntityService.getAllMemoized().pipe(
      map((entities) =>
        entities.map((be) => {
          return {
            billingEntity: be,
            canViewMembers$: this.billingEntityService.canViewMembers(`billingentities-${be.metadata.name}-admin`),
          } satisfies Payload;
        })
      )
    );
  }
}
