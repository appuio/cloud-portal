import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { Observable } from 'rxjs';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

@Component({
  selector: 'app-billingentity-detail',
  templateUrl: './billingentity-detail.component.html',
  styleUrls: ['./billingentity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityDetailComponent implements OnInit {
  billingEntity$?: Observable<BillingEntity>;
  billingEntityName = '';

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
