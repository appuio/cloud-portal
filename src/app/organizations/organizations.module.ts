import { NgModule } from '@angular/core';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { SharedModule } from '../shared/shared.module';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { JoinOrganizationDialogComponent } from './join-organization-dialog/join-organization-dialog.component';
import { EntityDataService, EntityDefinitionService } from '@ngrx/data';
import { entityMetadataMap, organizationEntityKey } from '../store/entity-metadata-map';
import { OrganizationDataService } from './organization-data.service';

@NgModule({
  declarations: [
    OrganizationsComponent,
    OrganizationEditComponent,
    OrganizationFormComponent,
    OrganizationMembersEditComponent,
    JoinOrganizationDialogComponent,
  ],
  imports: [SharedModule, OrganizationsRoutingModule],
  providers: [OrganizationDataService],
})
export default class OrganizationsModule {
  constructor(
    entityDefinitionService: EntityDefinitionService,
    organizationDataService: OrganizationDataService,
    entityDataService: EntityDataService
  ) {
    entityDefinitionService.registerMetadataMap(entityMetadataMap);
    entityDataService.registerService(organizationEntityKey, organizationDataService);
  }
}
