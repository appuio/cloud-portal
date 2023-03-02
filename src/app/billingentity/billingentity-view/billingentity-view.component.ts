import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { Observable } from 'rxjs';
import { faClose, faWarning } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billingentity-view.component.html',
  styleUrls: ['./billingentity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityViewComponent implements OnInit {
  billingEntity$?: Observable<BillingEntity>;
  billingEntityName = '';

  faClose = faClose;
  faWarning = faWarning;

  constructor(private route: ActivatedRoute, private billingService: BillingEntityCollectionService) {}

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name');
    if (!name) {
      throw new Error('name is required');
    }
    this.billingEntityName = name;
    this.billingEntity$ = this.billingService.getByKeyMemoized(this.billingEntityName);
  }
}
