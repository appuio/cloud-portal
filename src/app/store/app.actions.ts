import { createAction, props } from '@ngrx/store';
import { Zone } from '../types/zone';
import { HttpErrorResponse } from '@angular/common/http';
import { Permission } from './app.reducer';

export const loadZones = createAction('[App] Load zones');
export const loadZonesSuccess = createAction(
  '[App] Load zones successful',
  props<{ zones: Zone[] }>()
);
export const loadZonesFailure = createAction(
  '[App] Load zones failed',
  props<{ error: HttpErrorResponse }>()
);

export const setPermission = createAction(
  '[App] Set permission',
  props<{ permission: Permission }>()
);
