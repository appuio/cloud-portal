import { createAction, props } from '@ngrx/store';
import { Zone } from '../types/zone';
import { Permission } from './app.reducer';

export const loadZones = createAction('[App] Load Zones');
export const loadZonesSuccess = createAction('[App] Load Zones Success', props<{ zones: Zone[] }>());
export const loadZonesFailure = createAction('[App] Load Zones Failure', props<{ errorMessage: string }>());

export const setOrganizationSelectionEnabled = createAction(
  '[App] Set Organization Selection Enabled',
  props<{ organizationSelectionEnabled: boolean }>()
);

export const setPermission = createAction('[App] Set Permission', props<{ permission: Permission }>());
