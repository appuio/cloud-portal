import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { combineLatestWith, filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';
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

  faWarning = faWarning;
  faEdit = faEdit;
  faCancel = faCancel;
  faClose = faClose;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingEntityCollectionService
  ) {}

  ngOnInit(): void {
    this.isEditing$ = this.route.queryParamMap.pipe(map((queryParams) => queryParams.get('edit') === 'y'));
    this.viewModel$ = this.route.paramMap.pipe(
      map((params) => params.get('name') as string),
      filter((name) => name !== null),
      switchMap((name) => {
        this.billingEntityName = name;
        if (name === '$new') {
          return forkJoin([of(this.billingService.newBillingEntity()), of(true)]);
        }
        return this.billingService
          .streamByKeyMemoized(name)
          .pipe(combineLatestWith(this.billingService.canEditBilling(name)));
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
