import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PermissionGuard } from './permission.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'zones',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'zones',
    loadChildren: () => import('./zones/zones.module').then((m) => m.ZonesModule),
    canActivate: [PermissionGuard],
    data: {
      permission: 'zones',
      verb: 'list',
    },
  },
  {
    path: 'organizations',
    loadChildren: () => import('./organizations/organizations.module').then((m) => m.OrganizationsModule),
    canActivate: [PermissionGuard],
    data: {
      permission: 'organizations',
      verb: 'list',
    },
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module').then((m) => m.TeamsModule),
    data: {
      organizationSelectionEnabled: true,
    },
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'kubeconfig',
    loadChildren: () => import('./kubeconfig/kubeconfig.module').then((m) => m.KubeconfigDownloadModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
