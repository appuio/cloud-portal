import { Routes } from '@angular/router';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { InvitationsComponent } from './invitations.component';
import { InvitationPermissions } from '../types/invitation';
import { InvitationViewComponent } from './invitation-view/invitation-view.component';
import { InvitationEditComponent } from './invitation-edit/invitation-edit.component';
import { hideFirstTimeLoginDialogKey } from '../first-time-login-dialog/first-time-login-dialog.component';

export const routes: Routes = [
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
    data: {
      [hideFirstTimeLoginDialogKey]: true,
    },
  },
];
