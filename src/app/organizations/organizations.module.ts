import { NgModule } from '@angular/core';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { SharedModule } from '../shared/shared.module';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';

@NgModule({
    imports: [SharedModule, OrganizationsRoutingModule, OrganizationsComponent,
        OrganizationEditComponent,
        OrganizationFormComponent,
        OrganizationMembersEditComponent],
})
export default class OrganizationsModule {}
