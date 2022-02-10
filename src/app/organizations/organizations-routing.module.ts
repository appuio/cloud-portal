import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { PermissionGuard } from '../permission.guard';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { OrganizationMembersResolver } from './organization-members-edit/organization-members.resolver';

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
  {
    path: ':name/members',
    component: OrganizationMembersEditComponent,
    resolve: { organizationMembers: OrganizationMembersResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
