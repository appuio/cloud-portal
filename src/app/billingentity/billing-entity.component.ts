import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BillingEntity } from '../types/billing-entity';

import {
  faAdd,
  faDollarSign,
  faEdit,
  faInfo,
  faMagnifyingGlass,
  faUserGroup,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { combineLatestAll, forkJoin, from, map, Observable, of } from 'rxjs';
import { BillingEntityCollectionService } from '../store/billingentity-collection.service';
import { switchMap } from 'rxjs/operators';
import { JoinDialogService } from '../join-dialog/join-dialog.service';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { NgIf, NgFor } from '@angular/common';
import { LetDirective } from '@ngrx/component';

@Component({
    selector: 'app-billing-entity',
    templateUrl: './billing-entity.component.html',
    styleUrls: ['./billing-entity.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        LetDirective,
        NgIf,
        ButtonModule,
        RippleModule,
        FontAwesomeModule,
        RouterLink,
        NgFor,
        MessagesModule,
        SharedModule,
    ],
})
export class BillingEntityComponent implements OnInit {
  faWarning = faWarning;
  faInfo = faInfo;
  faEdit = faEdit;
  faUserGroup = faUserGroup;
  faDetails = faMagnifyingGlass;
  faAdd = faAdd;
  faDollarSign = faDollarSign;

  payload$?: Observable<ViewModel>;

  constructor(
    public billingEntityService: BillingEntityCollectionService,
    public joinDialogService: JoinDialogService
  ) {}

  ngOnInit(): void {
    this.payload$ = forkJoin([
      this.billingEntityService.getAllMemoized(),
      this.billingEntityService.canCreateBilling(),
    ]).pipe(
      switchMap(([entities, canCreateBilling]) => {
        if (entities.length === 0) {
          return of({
            canCreateBilling,
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
