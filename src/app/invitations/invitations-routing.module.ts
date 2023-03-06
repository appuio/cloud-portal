import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { InvitationsComponent } from './invitations.component';
import { InvitationPermissions } from '../types/invitation';

const routes: Routes = [
  {
    path: '',
    component: InvitationsComponent,
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
