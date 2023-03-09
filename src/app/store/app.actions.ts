import { createAction, props } from '@ngrx/store';

export const setOrganizationSelectionEnabled = createAction(
  '[App] Set Organization Selection Enabled',
  props<{ organizationSelectionEnabled: boolean }>()
);
