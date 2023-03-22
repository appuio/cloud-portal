import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UserEditComponent } from './user-edit/user-edit.component';

@NgModule({
  declarations: [UserEditComponent],
  imports: [UserRoutingModule, CommonModule, SharedModule],
})
export default class UserModule {}
