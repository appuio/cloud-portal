import { NgModule } from '@angular/core';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsComponent } from './teams.component';
import { SharedModule } from '../shared/shared.module';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { TeamEditComponent } from './team-edit/team-edit.component';

@NgModule({
  declarations: [TeamsComponent, JoinTeamDialogComponent, TeamEditComponent],
  imports: [SharedModule, TeamsRoutingModule],
})
export default class TeamsModule {}
