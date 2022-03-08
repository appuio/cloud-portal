import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTeam from './team.reducer';
import { Entity } from '../../types/entity';
import { Team } from '../../types/team';
import { selectRouteParam } from '../../store/router.selectors';

export const selectTeamState = createFeatureSelector<fromTeam.TeamState>(fromTeam.teamFeatureKey);

export const selectTeams = createSelector(selectTeamState, (state): Entity<Team[]> => {
  const organizations = [...state.teams.value];
  organizations.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }));
  return {
    state: state.teams.state,
    value: organizations,
  };
});

export const selectIsNewTeam = createSelector(selectRouteParam('name'), (name): boolean => name === '$new');
