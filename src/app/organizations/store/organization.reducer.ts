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
    OrganizationActions.saveOrganizationSuccess,
    (state, { organization }): OrganizationState => ({
      ...state,
      organizations: {
        value: [
          { ...organization, viewMembers: true, editOrganization: true },
          ...state.organizations.value.filter((o) => o.metadata.name != organization.metadata.name),
        ],
        state: EntityState.Loaded,
      },
    })
  )
);
