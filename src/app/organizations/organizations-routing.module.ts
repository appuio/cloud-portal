import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { OrganizationMembersResolver } from './organization-members-edit/organization-members.resolver';
import { UsersRolesResolver } from './users-roles.resolver';
import { OrganizationMembersEditResolver } from './organization-members-edit/organization-members-edit.resolver';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { OrganizationPermissions } from '../types/organization';
import { BillingEntityPermissions } from '../types/billing-entity';

const routes: Routes = [
  {
    path: '',
    component: OrganizationsComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...OrganizationPermissions, verb: 'list' }],
    },
  },
  {
    path: ':name',
    component: OrganizationEditComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [
        { ...OrganizationPermissions, verb: 'list' },
        { ...BillingEntityPermissions, verb: 'list' },
      ],
    },
  },
  {
    path: ':name/members',
    component: OrganizationMembersEditComponent,
    resolve: {
      organizationMembers: OrganizationMembersResolver,
      roleBindings: UsersRolesResolver,
      organizationMembersEditPermission: OrganizationMembersEditResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
