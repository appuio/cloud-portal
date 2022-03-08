import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { PermissionGuard } from '../permission.guard';
import { TeamEditComponent } from './team-edit/team-edit.component';
import { TeamResolver } from './team-edit/team.resolver';

const routes: Routes = [
  {
    path: '',
    component: TeamsComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'teams',
      verb: 'list',
    },
  },
  {
    path: ':organizationName/:name',
    component: TeamEditComponent,
    canActivate: [PermissionGuard],
    resolve: {
      team: TeamResolver,
    },
    data: {
      permission: 'teams',
      verb: 'update',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsRoutingModule {}
