import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BillingEntity } from '../types/billing-entity';

import { faAdd, faEdit, faInfo, faMagnifyingGlass, faUserGroup, faWarning } from '@fortawesome/free-solid-svg-icons';
import { combineLatestAll, forkJoin, from, map, Observable, of, take } from 'rxjs';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { switchMap } from 'rxjs/operators';

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
  faDetails = faMagnifyingGlass;

  payload$?: Observable<ViewModel>;

  constructor(public billingEntityService: BillingEntityCollectionService) {}

  ngOnInit(): void {
    this.payload$ = forkJoin([
      this.billingEntityService.getAllMemoized().pipe(take(1)),
      this.billingEntityService.canCreateBilling(),
    ]).pipe(
      switchMap(([entities, canCreateBilling]) => {
        if (entities.length === 0) {
          // no billing entities
          return of({
            canCreateBilling: canCreateBilling,
            billingModels: [],
          } satisfies ViewModel);
        }

        const beModels$: Observable<BillingModel>[] = entities.map((be) => {
          return forkJoin([
            of(be),
            // enrich the BE with information about permissions.
            this.billingEntityService.canEditMembers(`billingentities-${be.metadata.name}-admin`),
            this.billingEntityService.canEditBilling(be.metadata.name),
          ]).pipe(
            map(([billingEntity, canViewMembers, canEdit]) => {
              return {
                billingEntity,
                canViewMembers,
                canEdit,
              } satisfies BillingModel;
            })
          );
        });
        return forkJoin([
          of(canCreateBilling),
          // Collect all Billing models
          from(beModels$).pipe(combineLatestAll()),
        ]).pipe(
          map(([canCreateBilling, billingModels]) => {
            return {
              billingModels,
              canCreateBilling,
            } satisfies ViewModel;
          })
        );
      })
    );
  }

  protected readonly faAdd = faAdd;
}

interface ViewModel {
  billingModels: BillingModel[];
  canCreateBilling: boolean;
}

interface BillingModel {
  billingEntity: BillingEntity;
  canEdit: boolean;
  canViewMembers: boolean;
}
