import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectZones = createSelector(
  selectAppState,
  (state) => state.zones
);

export const selectPermissions = createSelector(
  selectAppState,
  (state) => state.permissions
);
