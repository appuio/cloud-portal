import { NgModule } from '@angular/core';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsComponent } from './teams.component';
import { SharedModule } from '../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { TeamEffects } from './store/team.effects';
import { StoreModule } from '@ngrx/store';
import { reducer, teamFeatureKey } from './store/team.reducer';
import { JoinTeamDialogComponent } from './join-team-dialog/join-team-dialog.component';
import { TeamEditComponent } from './team-edit/team-edit.component';

@NgModule({
  declarations: [TeamsComponent, JoinTeamDialogComponent, TeamEditComponent],
  imports: [
    SharedModule,
    TeamsRoutingModule,
    StoreModule.forFeature(teamFeatureKey, reducer),
    EffectsModule.forFeature([TeamEffects]),
  ],
})
export class TeamsModule {}
