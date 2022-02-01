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
    },
  },
  {
    path: 'organizations',
    loadChildren: () => import('./organizations/organizations.module').then((m) => m.OrganizationsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
