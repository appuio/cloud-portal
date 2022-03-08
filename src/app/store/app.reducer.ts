import { createReducer, on } from '@ngrx/store';
import { Zone } from '../types/zone';
import {
  loadOrganizations,
  loadOrganizationsFailure,
  loadOrganizationsSuccess,
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  setFocusOrganization,
  setOrganizationSelectionEnabled,
  setPermission,
} from './app.actions';
import { Entity, EntityState } from '../types/entity';
import { Organization } from '../types/organization';

export enum Verb {
  List = 'list',
  Update = 'update',
  Create = 'create',
  Delete = 'delete',
}

export interface Permission {
  zones: Verb[];
  organizations: Verb[];
  teams: Verb[];
}

export interface AppState {
  zones: Entity<Zone[]>;
  organizations: Entity<Organization[]>;
  permission: Permission;
  focusOrganizationName?: string;
  organizationSelectionEnabled: boolean;
}

const initialState: AppState = {
  zones: { value: [], state: EntityState.Unloaded },
  organizations: { value: [], state: EntityState.Unloaded },
  permission: {
    zones: [],
    organizations: [],
    teams: [],
  },
  organizationSelectionEnabled: false,
};

export const appReducer = createReducer(
  initialState,
  on(
    loadZones,
    (state): AppState => ({
      ...state,
      zones: { value: [], state: EntityState.Loading },
    })
  ),
  on(
    loadZonesSuccess,
    (state, { zones }): AppState => ({
      ...state,
      zones: { value: zones, state: EntityState.Loaded },
    })
  ),
  on(
    loadZonesFailure,
    (state): AppState => ({
      ...state,
      zones: { value: [], state: EntityState.Failed },
    })
  ),
  on(
    loadOrganizations,
    (state): AppState => ({
      ...state,
      zones: { value: [], state: EntityState.Loading },
      focusOrganizationName: undefined,
    })
  ),
  on(
    loadOrganizationsSuccess,
    (state, { organizations }): AppState => ({
      ...state,
      organizations: { value: organizations, state: EntityState.Loaded },
      focusOrganizationName: organizations[0]?.metadata?.name,
    })
  ),
  on(
    loadOrganizationsFailure,
    (state): AppState => ({
      ...state,
      organizations: { value: [], state: EntityState.Failed },
      focusOrganizationName: undefined,
    })
  ),
  on(
    setFocusOrganization,
    (state, { focusOrganizationName }): AppState => ({
      ...state,
      focusOrganizationName: focusOrganizationName,
    })
  ),
  on(
    setOrganizationSelectionEnabled,
    (state, { organizationSelectionEnabled }): AppState => ({
      ...state,
      organizationSelectionEnabled: organizationSelectionEnabled,
    })
  ),
  on(setPermission, (state, { permission }): AppState => ({ ...state, permission }))
);
