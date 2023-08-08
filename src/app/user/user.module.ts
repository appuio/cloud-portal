import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UserEditComponent } from './user-edit/user-edit.component';

@NgModule({
    imports: [UserRoutingModule, CommonModule, SharedModule, UserEditComponent],
})
export default class UserModule {}
