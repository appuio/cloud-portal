import { Routes } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { TeamEditComponent } from './team-edit/team-edit.component';

export const routes: Routes = [
  {
    path: '',
    component: TeamsComponent,
  },
  {
    path: ':organizationName/:name',
    component: TeamEditComponent,
  },
];
