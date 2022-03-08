import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState, Permission, Verb } from './app.reducer';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectZones = createSelector(selectAppState, (state) => state.zones);

export const selectPermission = createSelector(selectAppState, (state) => state.permission);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectHasPermission = (permission: keyof Permission, verb: Verb) => {
  return createSelector(selectAppState, (state) => state.permission[permission].includes(verb));
};

export const selectOrganizations = createSelector(selectAppState, (state) => state.organizations.value);
export const selectFocusOrganizationName = createSelector(selectAppState, (state) => state.focusOrganizationName);
export const selectOrganizationSelectionEnabled = createSelector(
  selectAppState,
  (state) => state.organizationSelectionEnabled
);
