import { createAction, props } from '@ngrx/store';
import { Organization } from '../../types/organization';

export const loadOrganizations = createAction('[Organization] Load Organizations');

export const loadOrganizationsSuccess = createAction(
  '[Organization] Load Organizations Success',
  props<{ organizations: Organization[] }>()
);

export const loadOrganizationsFailure = createAction(
  '[Organization] Load Organizations Failure',
  props<{ error: string }>()
);

export const saveOrganization = createAction(
  '[Organization] Save Organizations',
  props<{ organization: Organization; isNew: boolean }>()
);

export const saveOrganizationsSuccess = createAction(
  '[Organization] Save Organizations Success',
  props<{ organization: Organization }>()
);

export const saveOrganizationsFailure = createAction(
  '[Organization] Save Organizations Failure',
  props<{ error: string }>()
);
