import { NgModule } from '@angular/core';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { SharedModule } from '../shared/shared.module';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { EntityDataService } from '@ngrx/data';
import { organizationEntityKey } from '../store/entity-metadata-map';
import { OrganizationDataService } from './organization-data.service';
import { OrganizationCollectionService } from './organization-collection.service';

@NgModule({
  declarations: [
    OrganizationsComponent,
    OrganizationEditComponent,
    OrganizationFormComponent,
    OrganizationMembersEditComponent,
    JoinOrganizationDialogComponent,
  ],
  imports: [SharedModule, OrganizationsRoutingModule],
  providers: [OrganizationDataService, OrganizationCollectionService],
})
export default class OrganizationsModule {
  constructor(
    organizationDataService: OrganizationDataService,
    organizationCollectionService: OrganizationCollectionService,
    entityDataService: EntityDataService
  ) {
    entityDataService.registerService(organizationEntityKey, organizationDataService);
    organizationCollectionService.getAll(); // get initial data upon module load, maybe not the perfect place here...
  }
}
