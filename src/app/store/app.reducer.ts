import { createReducer, on } from '@ngrx/store';
import { Zone } from '../types/zone';
import {
  loadUser,
  loadUserFailure,
  loadUserSuccess,
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  setFocusOrganization,
  setOrganizationSelectionEnabled,
  setPermission,
} from './app.actions';
import { Entity, EntityState } from '../types/entity';
import { Organization } from '../types/organization';
import { User } from '../types/user';

export enum Verb {
  List = 'list',
  Update = 'update',
  Create = 'create',
  Delete = 'delete',
}

export interface Permission {
  zones: Verb[];
  organizations: Verb[];
}

export interface AppState {
  zones: Entity<Zone[]>;
  organizations: Entity<Organization[]>;
  permission: Permission;
  focusOrganizationName?: string;
  organizationSelectionEnabled: boolean;
  user: Entity<User | null>;
}

const initialState: AppState = {
  zones: { value: [], state: EntityState.Unloaded },
  organizations: { value: [], state: EntityState.Unloaded },
  permission: {
    zones: [],
    organizations: [],
  },
  organizationSelectionEnabled: false,
  user: { value: null, state: EntityState.Unloaded },
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
    loadUser,
    (state): AppState => ({
      ...state,
      user: { value: null, state: EntityState.Loading },
    })
  ),
  on(
    loadUserSuccess,
    (state, { user }): AppState => ({
      ...state,
      user: { value: user, state: EntityState.Loaded },
      focusOrganizationName:
        user.spec.preferences?.defaultOrganizationRef ?? state.organizations.value[0]?.metadata?.name,
    })
  ),
  on(
    loadUserFailure,
    (state): AppState => ({
      ...state,
      user: { value: null, state: EntityState.Failed },
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
