import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const appRoutes: Routes = [
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
    loadChildren: () => import('./zones/zones.routing').then((m) => m.routes),
    title: $localize`Zones`,
  },
  {
    path: 'organizations',
    loadChildren: () => import('./organizations/organizations.routing').then((m) => m.routes),
    title: $localize`Organizations`,
  },
  {
    path: 'teams',
    loadChildren: () => import('./teams/teams.routing').then((m) => m.routes),
    data: {
      organizationSelectionEnabled: true,
    },
    title: $localize`Teams`,
  },
  {
    path: 'billingentities',
    loadChildren: () => import('./billingentity/billing-entity.routing').then((m) => m.routes),
    title: $localize`Billing`,
  },
  {
    path: 'invitations',
    loadChildren: () => import('./invitations/invitations.routing').then((m) => m.routes),
    title: $localize`Invitations`,
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.routing').then((m) => m.routes),
    title: $localize`User Settings`,
  },
  {
    path: 'kubeconfig',
    loadChildren: () => import('./kubeconfig/kubeconfig.routing').then((m) => m.routes),
    title: $localize`Kubeconfig`,
  },
  {
    path: 'feedback',
    loadChildren: () => import('./productboard/productboard.routing').then((m) => m.routes),
    title: $localize`Feedback`,
  },
];
