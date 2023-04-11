import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { BehaviorSubject, filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { faCancel, faClose, faEdit, faWarning } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

@Component({
  selector: 'app-billingentity-detail',
  templateUrl: './billing-entity-detail.component.html',
  styleUrls: ['./billing-entity-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingEntityDetailComponent implements OnInit {
  viewModel$?: Observable<ViewModel>;
  isEditing$?: Observable<boolean>;
  billingEntityName = '';
  updatedBillingEntity: BehaviorSubject<BillingEntity | undefined>;

  faWarning = faWarning;
  faEdit = faEdit;
  faCancel = faCancel;
  faClose = faClose;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingEntityCollectionService
  ) {
    this.updatedBillingEntity = new BehaviorSubject<BillingEntity | undefined>(undefined);
  }

  ngOnInit(): void {
    this.isEditing$ = this.route.queryParamMap.pipe(map((queryParams) => queryParams.get('edit') === 'y'));
    this.viewModel$ = this.updatedBillingEntity.pipe(
      switchMap((be) => {
        if (be) {
          return forkJoin([of(be), this.billingService.canEditBilling(be.metadata.name)]);
        }
        return this.route.paramMap.pipe(
          map((params) => params.get('name') as string),
          filter((name) => name !== null),
          switchMap((name) => {
            this.billingEntityName = name;
            if (name === '$new') {
              return forkJoin([of(this.billingService.newBillingEntity()), of(true)]);
            }
            return forkJoin([this.billingService.getByKeyMemoized(name), this.billingService.canEditBilling(name)]);
          })
        );
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

  updateBillingEntity(event: BillingEntity): void {
    this.updatedBillingEntity.next(event);
  }
}

interface ViewModel {
  billingEntity: BillingEntity;
  canEdit: boolean;
}
