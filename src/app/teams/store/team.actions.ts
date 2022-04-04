import { createAction, props } from '@ngrx/store';
import { Team } from '../../types/team';
import { Verb } from '../../store/app.reducer';

export const loadTeams = createAction('[Team] Load Teams');

export const loadTeamsSuccess = createAction('[Team] Load Teams Success', props<{ teams: Team[] }>());

export const loadTeamsFailure = createAction('[Team] Load Teams Failure', props<{ errorMessage: string }>());

export const deleteTeam = createAction('[Team] Delete Teams', props<{ name: string }>());

export const deleteTeamSuccess = createAction('[Team] Delete Teams Success', props<{ name: string }>());

export const deleteTeamFailure = createAction('[Team] Delete Teams Failure', props<{ errorMessage: string }>());

export const loadTeamPermissions = createAction('[Team] Load Team Permissions');

export const loadTeamPermissionsSuccess = createAction(
  '[Team] Load Team Permissions Success',
  props<{ verbs: Verb[] }>()
);

export const loadTeamPermissionsFailure = createAction(
  '[Team] Load Team Permissions Failure',
  props<{ errorMessage: string }>()
);
