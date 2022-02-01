import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromOrganization from './organization.reducer';

export const selectOrganizationState = createFeatureSelector<fromOrganization.OrganizationState>(
  fromOrganization.organizationFeatureKey
);

export const selectOrganizations = createSelector(selectOrganizationState, (state) => state.organizations);
