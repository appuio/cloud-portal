import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { TeamEditComponent } from './team-edit/team-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TeamsComponent,
  },
  {
    path: ':organizationName/:name',
    component: TeamEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamsRoutingModule {}
