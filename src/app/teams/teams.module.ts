import { NgModule } from '@angular/core';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsComponent } from './teams.component';
import { SharedModule } from '../shared/shared.module';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { TeamEditComponent } from './team-edit/team-edit.component';

@NgModule({
    imports: [SharedModule, TeamsRoutingModule, TeamsComponent, JoinTeamDialogComponent, TeamEditComponent],
})
export default class TeamsModule {}
