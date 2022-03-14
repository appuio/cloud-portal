import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTeam from './team.reducer';
import { Entity } from '../../types/entity';
import { Team } from '../../types/team';
import { Verb } from '../../store/app.reducer';

export const selectTeamState = createFeatureSelector<fromTeam.TeamState>(fromTeam.teamFeatureKey);

export const selectTeams = createSelector(selectTeamState, (state): Entity<Team[]> => {
  const organizations = [...state.teams.value];
  organizations.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }));
  return {
    state: state.teams.state,
    value: organizations,
  };
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectHasTeamPermission = (verb: Verb) => {
  return createSelector(selectTeamState, (state) => state.permissions.includes(verb));
};
