import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { faClose, faWarning } from '@fortawesome/free-solid-svg-icons';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BillingEntity } from '../../types/billing-entity';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationEditComponent implements OnInit {
  organization$?: Observable<Organization>;
  billingEntities$?: Observable<BillingEntity[]>;

  isNew = false;
  faClose = faClose;
  faWarning = faWarning;

  constructor(
    private organizationCollectionService: OrganizationCollectionService,
    private billingService: BillingEntityCollectionService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const name = this.activatedRoute.snapshot.paramMap.get('name');
    if (!name || name === '$new') {
      this.isNew = true;
      this.organization$ = of(newOrganization('', ''));
    } else {
      this.organization$ = this.organizationCollectionService.getByKeyMemoized(name);
      this.billingEntities$ = this.billingService.getAllMemoized();
    }
  }
}
