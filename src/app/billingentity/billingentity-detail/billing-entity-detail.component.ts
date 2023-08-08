import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BillingEntity } from '../../types/billing-entity';
import { combineLatestWith, filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { faCancel, faClose, faEdit, faWarning } from '@fortawesome/free-solid-svg-icons';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';
import { SharedModule } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { BillingEntityFormComponent } from '../billingentity-form/billing-entity-form.component';
import { BillingEntityViewComponent } from '../billingentity-view/billing-entity-view.component';
import { BackLinkDirective } from '../../shared/back-link.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { LetDirective, PushPipe } from '@ngrx/component';

@Component({
    selector: 'app-billingentity-detail',
    templateUrl: './billing-entity-detail.component.html',
    styleUrls: ['./billing-entity-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        LetDirective,
        NgIf,
        RouterLink,
        FontAwesomeModule,
        BackLinkDirective,
        BillingEntityViewComponent,
        BillingEntityFormComponent,
        MessagesModule,
        SharedModule,
        PushPipe,
    ],
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
