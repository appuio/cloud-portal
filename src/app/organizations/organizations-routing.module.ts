import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
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
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
