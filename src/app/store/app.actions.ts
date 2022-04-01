import { createAction, props } from '@ngrx/store';
import { Zone } from '../types/zone';
import { HttpErrorResponse } from '@angular/common/http';
import { Permission } from './app.reducer';
import { Organization } from '../types/organization';
import { User } from '../types/user';

export const loadZones = createAction('[App] Load Zones');
export const loadZonesSuccess = createAction('[App] Load Zones Success', props<{ zones: Zone[] }>());
export const loadZonesFailure = createAction('[App] Load Zones Failure', props<{ error: HttpErrorResponse }>());

export const loadOrganizations = createAction('[App] Load Organizations');
export const loadOrganizationsSuccess = createAction(
  '[App] Load Organizations Success',
  props<{ organizations: Organization[] }>()
);
export const loadOrganizationsFailure = createAction('[App] Load Organizations Failure', props<{ error: string }>());
export const setFocusOrganization = createAction(
  '[App] Set Focus Organizations',
  props<{ focusOrganizationName: string }>()
);
export const setOrganizationSelectionEnabled = createAction(
  '[App] Set Organization Selection Enabled',
  props<{ organizationSelectionEnabled: boolean }>()
);

export const setPermission = createAction('[App] Set Permission', props<{ permission: Permission }>());

export const loadUser = createAction('[App] Load User', props<{ username: string }>());
export const loadUserSuccess = createAction('[App] Load User Success', props<{ user: User }>());
export const loadUserFailure = createAction('[App] Load User Failure', props<{ error: string }>());
