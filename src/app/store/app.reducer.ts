import { createReducer, on } from '@ngrx/store';
import { Zone } from '../types/zone';
import {
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  setOrganizationSelectionEnabled,
  setPermission,
} from './app.actions';
import { Entity, EntityState } from '../types/entity';

export enum Verb {
  List = 'list',
  Update = 'update',
  Create = 'create',
  Delete = 'delete',
}

export interface Permission {
  zones: Verb[];
}

export interface AppState {
  zones: Entity<Zone[]>;
  permission: Permission;
  organizationSelectionEnabled: boolean;
}

const initialState: AppState = {
  zones: { value: [], state: EntityState.Unloaded },
  permission: {
    zones: [],
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
    setOrganizationSelectionEnabled,
    (state, { organizationSelectionEnabled }): AppState => ({
      ...state,
      organizationSelectionEnabled: organizationSelectionEnabled,
    })
  ),
  on(setPermission, (state, { permission }): AppState => ({ ...state, permission }))
);
