import { createAction, props } from '@ngrx/store';
import { Organization } from '../../types/organization';

export const loadOrganizations = createAction('[Organization] Load organizations');
export const loadOrganizationsSuccess = createAction(
  '[Organization] Load Organizations Success',
  props<{ organizations: Organization[] }>()
);
export const loadOrganizationsFailure = createAction(
  '[Organization] Load Organizations Failure',
  props<{ errorMessage: string }>()
);

export const saveOrganizationSuccess = createAction(
  '[Organization] Save Organization Success',
  props<{ organization: Organization }>()
);
