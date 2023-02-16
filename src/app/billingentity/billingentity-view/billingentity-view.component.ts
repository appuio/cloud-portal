import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { Observable, of } from 'rxjs';
import { faClose } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-billingentity-view',
  templateUrl: './billingentity-view.component.html',
  styleUrls: ['./billingentity-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityViewComponent implements OnInit {
  billingEntity$?: Observable<BillingEntity>;

  faClose = faClose;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(({ billingEntity }) => {
      this.billingEntity$ = of(billingEntity);
    });
  }
}
