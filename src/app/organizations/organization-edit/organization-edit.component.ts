import { ChangeDetectionStrategy, Component } from '@angular/core';
import { newOrganization, Organization } from '../../types/organization';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { OrganizationCollectionService } from '../../store/organization-collection.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationEditComponent {
  organization$?: Observable<Organization>;
  isNew$ = of(false);
  faClose = faClose;

  constructor(
    private organizationCollectionService: OrganizationCollectionService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.data.subscribe(({ organization }) => {
      this.isNew$ = of(organization === undefined);
      if (organization) {
        this.organization$ = of(organization);
      } else {
        this.organization$ = of(newOrganization('', ''));
      }
    });
  }
}
