import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZonesComponent } from './zones/zones.component';
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
    component: ZonesComponent,
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
    path: 'references',
    loadChildren: () => import('./references/references.module').then((m) => m.ReferencesModule),
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
