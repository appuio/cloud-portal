import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { Observable } from 'rxjs';
import { faClose, faWarning } from '@fortawesome/free-solid-svg-icons';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../../store/kubernetes-collection.service';
import { billingEntityEntityKey } from '../../store/entity-metadata-map';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billingentity-view.component.html',
  styleUrls: ['./billingentity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityViewComponent implements OnInit {
  billingEntity$?: Observable<BillingEntity>;
  billingEntityName: string;

  faClose = faClose;
  faWarning = faWarning;

  private billingService: KubernetesCollectionService<BillingEntity>;

  constructor(private route: ActivatedRoute, private entityFactory: KubernetesCollectionServiceFactory<BillingEntity>) {
    this.billingService = entityFactory.create(billingEntityEntityKey);
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name is required');
    }
    this.billingEntityName = name;
  }

  ngOnInit(): void {
    this.billingEntity$ = this.billingService.getByKeyMemoized(this.billingEntityName);
  }
}
