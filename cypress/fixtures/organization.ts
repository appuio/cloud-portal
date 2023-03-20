import { Organization, OrganizationSpec } from '../../src/app/types/organization';

export interface OrganizationConfig {
  name: string;
  displayName?: string;
  billingRef?: string;
}

export const organizationVshn = createOrganization({
  name: 'vshn',
  displayName: 'VSHN - the DevOps Company',
});
export const organizationNxt = createOrganization({
  name: 'nxt',
  displayName: 'nxt Engineering GmbH',
});

export const organizationListNxtVshn = {
  items: [organizationNxt, organizationVshn],
};

export const organizationListNxtVshnWithDisplayName = {
  items: [
    createOrganization({
      name: 'nxt',
      displayName: 'nxt Engineering GmbH',
      billingRef: 'be-2345',
    }),
    createOrganization({
      name: 'vshn',
      displayName: 'VSHN AG',
      billingRef: 'be-2347',
    }),
  ],
};

export function createOrganization(organizationConfig: OrganizationConfig): Organization {
  let spec: OrganizationSpec = {};
  if (organizationConfig.displayName) {
    spec = {
      displayName: organizationConfig.displayName,
      billingEntityRef: organizationConfig.billingRef,
    };
  }
  return {
    kind: 'Organization',
    apiVersion: 'organization.appuio.io/v1',
    metadata: {
      name: organizationConfig.name,
    },
    spec,
  };
}

export function setOrganization(cy: Cypress.cy, ...org: Organization[]): void {
  cy.intercept('GET', 'appuio-api/apis/organization.appuio.io/v1/organizations', {
    body: { items: [...org] },
  }).as('organizationList');
}
