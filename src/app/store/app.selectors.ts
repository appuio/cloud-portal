import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState, Permission, Verb } from './app.reducer';
import { SelectItem } from 'primeng/api';
import { selectRouteParams } from './router.selectors';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectZones = createSelector(selectAppState, (state) => state.zones);

export const selectZoneByName = createSelector(selectZones, selectRouteParams, (zones, routeParams) =>
  zones.value.find((z) => z.metadata.name === routeParams['name'])
);

export const selectPermission = createSelector(selectAppState, (state) => state.permission);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const selectHasPermission = (permission: keyof Permission, verb: Verb) => {
  return createSelector(selectAppState, (state) => state.permission[permission].includes(verb));
};

export const selectOrganizationSelectItems = createSelector(selectAppState, (state) =>
  state.organizations.value.map(
    (o) =>
      ({
        value: o.metadata.name,
        label: o.spec.displayName ? `${o.spec.displayName} (${o.metadata.name})` : o.metadata.name,
      } as SelectItem)
  )
);
export const selectFocusOrganizationName = createSelector(selectAppState, (state) => state.focusOrganizationName);
export const selectOrganizationSelectionEnabled = createSelector(
  selectAppState,
  (state) => state.organizationSelectionEnabled
);
export const selectUser = createSelector(selectAppState, (state) => state.user);
