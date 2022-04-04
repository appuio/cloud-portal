import { createAction, props } from '@ngrx/store';
import { Organization } from '../../types/organization';

export const loadOrganizations = createAction('[Organization] Load organizations');
export const loadOrganizationsSuccess = createAction(
  '[Organization] Load Organizations Success',
  props<{ organizations: Organization[] }>()
);
export const loadOrganizationsFailure = createAction(
  '[Organization] Load Organizations Failure',
  props<{ error: string }>()
);

export const saveOrganization = createAction(
  '[Organization] Save Organization',
  props<{ organization: Organization; isNew: boolean }>()
);

export const saveOrganizationSuccess = createAction(
  '[Organization] Save Organization Success',
  props<{ organization: Organization }>()
);

export const saveOrganizationFailure = createAction(
  '[Organization] Save Organization Failure',
  props<{ error: object }>()
);
