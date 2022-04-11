import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DefaultOrganizationFormComponent } from './default-organization-form/default-organization-form.component';

@NgModule({
  declarations: [UserSettingsComponent, DefaultOrganizationFormComponent],
  imports: [UserRoutingModule, CommonModule, SharedModule],
})
export class UserModule {}
