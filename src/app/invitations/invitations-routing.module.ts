import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { InvitationsComponent } from './invitations.component';
import { InvitationPermissions } from '../types/invitation';
import { InvitationViewComponent } from './invitation-view/invitation-view.component';
import { InvitationEditComponent } from './invitation-edit/invitation-edit.component';

const routes: Routes = [
  {
    path: '',
    component: InvitationsComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...InvitationPermissions, verb: 'list' }],
    },
  },
  {
    path: 'create',
    component: InvitationEditComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...InvitationPermissions, verb: 'create' }],
    },
  },
  {
    path: ':name',
    component: InvitationViewComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...InvitationPermissions, verb: 'list' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationsRoutingModule {}
