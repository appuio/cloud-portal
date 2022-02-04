import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { PermissionGuard } from '../permission.guard';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'organizations',
      verb: 'list',
    },
  },
  {
    path: ':name',
    component: OrganizationEditComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'organizations',
      verb: 'update',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
