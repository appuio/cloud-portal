import { createReducer, on } from '@ngrx/store';
import * as TeamActions from './team.actions';
import { Team } from '../../types/team';
import { Entity, EntityState } from '../../types/entity';
import { Verb } from '../../store/app.reducer';

export const teamFeatureKey = 'team';

export interface TeamState {
  teams: Entity<Team[]>;
  permissions: Verb[];
}

export const initialState: TeamState = {
  teams: {
    state: EntityState.Unloaded,
    value: [],
  },
  permissions: [],
};

export const reducer = createReducer(
  initialState,
  on(
    TeamActions.loadTeams,
    (state): TeamState => ({
      ...state,
      teams: { value: [], state: EntityState.Loading },
    })
  ),
  on(
    TeamActions.loadTeamsSuccess,
    (state, { teams }): TeamState => ({
      ...state,
      teams: { value: teams, state: EntityState.Loaded },
    })
  ),
  on(
    TeamActions.loadTeamsFailure,
    (state): TeamState => ({
      ...state,
      teams: { value: [], state: EntityState.Failed },
    })
  ),
  on(
    TeamActions.deleteTeamSuccess,
    (state, { name }): TeamState => ({
      ...state,
      teams: { value: state.teams.value.filter((d) => d.metadata.name !== name), state: state.teams.state },
    })
  ),
  on(
    TeamActions.loadTeamPermissionsSuccess,
    (state, { verbs }): TeamState => ({
      ...state,
      permissions: [...verbs],
    })
  ),
  on(
    TeamActions.loadTeamPermissions,
    (state): TeamState => ({
      ...state,
      permissions: [],
    })
  )
);
