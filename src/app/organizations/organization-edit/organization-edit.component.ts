import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { faClose, faWarning } from '@fortawesome/free-solid-svg-icons';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatestWith, map, Observable, of } from 'rxjs';
import { BillingEntity } from '../../types/billing-entity';
import { BillingEntityCollectionService } from '../../store/billingentity-collection.service';

interface Payload {
  organization: Organization;
  billingEntities: BillingEntity[];
}

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationEditComponent implements OnInit {
  payload$?: Observable<Payload>;

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
    let org$: Observable<Organization>;
    if (!name || name === '$new') {
      this.isNew = true;
      org$ = of(newOrganization('', '', ''));
    } else {
      org$ = this.organizationCollectionService.getByKeyMemoized(name);
    }

    this.payload$ = this.billingService.getAllMemoized().pipe(
      combineLatestWith(org$),
      map(([billingEntities, organization]) => {
        return { organization, billingEntities } satisfies Payload;
      })
    );
  }
}
