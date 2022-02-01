import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromOrganization from './organization.reducer';
import { Organization } from '../../types/organization';
import { Entity } from '../../types/entity';
import { selectRouteParam } from '../../store/router.selectors';

export const selectOrganizationState = createFeatureSelector<fromOrganization.OrganizationState>(
  fromOrganization.organizationFeatureKey
);

export const selectOrganizations = createSelector(selectOrganizationState, (state): Entity<Organization[]> => {
  const organizations = [...state.organizations.value];
  organizations.sort((a, b) => (a.metadata.name < b.metadata.name ? -1 : 1));
  return {
    state: state.organizations.state,
    value: organizations,
  };
});

export const selectOrganization = createSelector(
  selectRouteParam('name'),
  selectOrganizationState,
  (name, state): Organization | undefined => {
    if (name === '$new') {
      return {
        apiVersion: 'organization.appuio.io/v1',
        kind: 'Organization',
        spec: {
          displayName: '',
        },
        metadata: {
          name: '',
        },
      };
    }
    return state.organizations.value.find((o) => o.metadata.name === name);
  }
);

export const selectIsNewOrganization = createSelector(selectRouteParam('name'), (name): boolean => name === '$new');
