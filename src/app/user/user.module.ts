import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserRoutingModule } from './user-routing.module';

@NgModule({
  declarations: [UserSettingsComponent],
  imports: [UserRoutingModule, CommonModule],
})
export class UserModule {}
