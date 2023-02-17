import { NgModule } from '@angular/core';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { SharedModule } from '../shared/shared.module';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { EntityDataService } from '@ngrx/data';
import { organizationMembersEntityKey } from '../store/entity-metadata-map';
import { OrganizationMembersCollectionService } from './organization-members/organization-members-collection.service';
import { OrganizationMembersDataService } from './organization-members/organization-members-data.service';

@NgModule({
  declarations: [
    OrganizationsComponent,
    OrganizationEditComponent,
    OrganizationFormComponent,
    OrganizationMembersEditComponent,
    JoinOrganizationDialogComponent,
  ],
  imports: [SharedModule, OrganizationsRoutingModule],
  providers: [OrganizationMembersCollectionService],
})
export default class OrganizationsModule {
  constructor(organizationMembersDataService: OrganizationMembersDataService, entityDataService: EntityDataService) {
    entityDataService.registerService(organizationMembersEntityKey, organizationMembersDataService);
  }
}
