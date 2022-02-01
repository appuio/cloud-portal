import { createReducer, on } from '@ngrx/store';
import { Zone } from '../types/zone';
import { loadZones, loadZonesFailure, loadZonesSuccess, setPermission } from './app.actions';
import { Entity, EntityState } from '../types/entity';

export interface Permission {
  zones: boolean;
  organizations: boolean;
}

export interface AppState {
  zones: Entity<Zone[]>;
  permission: Permission;
}

const initialState: AppState = {
  zones: { value: [], state: EntityState.Unloaded },
  permission: {
    zones: false,
    organizations: false,
  },
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
  on(setPermission, (state, { permission }): AppState => ({ ...state, permission }))
);
