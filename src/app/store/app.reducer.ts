import { createReducer, on } from '@ngrx/store';
import { setOrganizationSelectionEnabled } from './app.actions';

export enum Verb {
  List = 'list',
  Update = 'update',
  Create = 'create',
  Delete = 'delete',
}

export interface AppState {
  organizationSelectionEnabled: boolean;
}

const initialState: AppState = {
  organizationSelectionEnabled: false,
};

export const appReducer = createReducer(
  initialState,
  on(
    setOrganizationSelectionEnabled,
    (state, { organizationSelectionEnabled }): AppState => ({
      ...state,
      organizationSelectionEnabled: organizationSelectionEnabled,
    })
  )
);
