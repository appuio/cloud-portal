import { createReducer, on } from '@ngrx/store';
import * as OrganizationActions from './organization.actions';
import { Entity, EntityState } from '../../types/entity';
import { Organization } from '../../types/organization';

export const organizationFeatureKey = 'organization';

export interface OrganizationState {
  organizations: Entity<Organization[]>;
}

export const initialState: OrganizationState = {
  organizations: {
    state: EntityState.Unloaded,
    value: [],
  },
};

export const reducer = createReducer(
  initialState,

  on(
    OrganizationActions.loadOrganizations,
    (state): OrganizationState => ({
      ...state,
      organizations: { value: [], state: EntityState.Loading },
    })
  ),
  on(
    OrganizationActions.loadOrganizationsSuccess,
    (state, { organizations }): OrganizationState => ({
      ...state,
      organizations: { value: organizations, state: EntityState.Loaded },
    })
  ),
  on(
    OrganizationActions.loadOrganizationsFailure,
    (state): OrganizationState => ({
      ...state,
      organizations: { value: [], state: EntityState.Failed },
    })
  ),
  on(
    OrganizationActions.saveOrganizationsSuccess,
    (state, { organization }): OrganizationState => ({
      ...state,
      organizations: { value: [organization, ...state.organizations.value], state: EntityState.Loaded },
    })
  )
);
