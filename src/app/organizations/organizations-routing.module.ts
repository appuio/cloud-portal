import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { PermissionGuard } from '../permission.guard';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { OrganizationMembersResolver } from './organization-members-edit/organization-members.resolver';
import { UsersRolesResolver } from './users-roles.resolver';

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
  },
  {
    path: ':name/members',
    component: OrganizationMembersEditComponent,
    resolve: { organizationMembers: OrganizationMembersResolver, usersRoles: UsersRolesResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
