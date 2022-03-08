import { createAction, props } from '@ngrx/store';
import { Team } from '../../types/team';

export const loadTeams = createAction('[Team] Load Teams');

export const loadTeamsSuccess = createAction('[Team] Load Teams Success', props<{ teams: Team[] }>());

export const loadTeamsFailure = createAction('[Team] Load Teams Failure', props<{ error: string }>());

export const deleteTeam = createAction('[Team] Delete Teams', props<{ name: string }>());

export const deleteTeamSuccess = createAction('[Team] Delete Teams Success', props<{ name: string }>());

export const deleteTeamFailure = createAction('[Team] Delete Teams Failure', props<{ error: string }>());
