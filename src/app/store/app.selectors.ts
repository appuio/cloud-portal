import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';
import { selectRouteParams } from './router.selectors';
import { Entity } from '../types/entity';
import { Zone } from '../types/zone';
import { urlify } from '../core/urlify';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectZones = createSelector(selectAppState, (state) => state.zones);

export const selectZoneByName = createSelector(selectZones, selectRouteParams, (zones, routeParams) => {
  const zone = zones.value.find((z) => urlify(z.metadata.name) === routeParams['name']);
  return { value: zone, state: zones.state } as Entity<Zone>;
});

export const selectPermission = createSelector(selectAppState, (state) => state.permission);

export const selectOrganizationSelectionEnabled = createSelector(
  selectAppState,
  (state) => state.organizationSelectionEnabled
);
