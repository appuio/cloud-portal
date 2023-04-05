import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { faCancel, faClose, faEdit, faWarning } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

@Component({
  selector: 'app-billingentity-detail',
  templateUrl: './billingentity-detail.component.html',
  styleUrls: ['./billingentity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingentityDetailComponent implements OnInit {
  viewModel$?: Observable<ViewModel>;
  isEditing$?: Observable<boolean>;
  billingEntityName = '';

  faWarning = faWarning;
  faEdit = faEdit;
  faCancel = faCancel;
  faClose = faClose;

  constructor(private route: ActivatedRoute, private billingService: BillingEntityCollectionService) {}

  ngOnInit(): void {
    this.isEditing$ = this.route.queryParamMap.pipe(map((queryParams) => queryParams.get('edit') === 'y'));
    this.viewModel$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const name = params.get('name');
        if (!name) {
          throw new Error('name is required');
        }
        this.billingEntityName = name;
        if (name === '$new') {
          return forkJoin([of(this.billingService.newBillingEntity()), of(true)]);
        }
        return forkJoin([this.billingService.getByKeyMemoized(name), this.billingService.canEditBilling(name)]);
      }),
      map(([billingEntity, canEdit]) => {
        return {
          billingEntity,
          canEdit,
        } satisfies ViewModel;
      })
    );
  }

  isNewBE(be: BillingEntity): boolean {
    return !!be.metadata.generateName;
  }
}

interface ViewModel {
  billingEntity: BillingEntity;
  canEdit: boolean;
}
