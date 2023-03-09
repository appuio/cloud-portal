import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

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
    loadChildren: () => import('./zones/zones.module'),
    title: $localize`Zones`,
  },
  {
    path: 'organizations',
    loadChildren: () => import('./organizations/organizations.module'),
    title: $localize`Organizations`,
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.module'),
    data: {
      organizationSelectionEnabled: true,
    },
    title: $localize`Teams`,
  },
  {
    path: 'billingentities',
    loadChildren: () => import('./billingentity/billing-entity.module'),
    title: $localize`Billing`,
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module'),
    title: $localize`User Settings`,
  },
  {
    path: 'kubeconfig',
    loadChildren: () => import('./kubeconfig/kubeconfig.module'),
    title: $localize`Kubeconfig`,
  },
  {
    path: 'feedback',
    loadChildren: () => import('./productboard/productboard.module'),
    title: $localize`Feedback`,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
