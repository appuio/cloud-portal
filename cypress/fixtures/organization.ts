import { Organization, OrganizationList, OrganizationSpec } from '../../src/app/types/organization';

export interface OrganizationConfig {
  name: string;
  displayName?: string;
}

export interface OrganizationListConfig {
  items: Organization[];
}

export const organizationVshn = createOrganization({
  name: 'vshn',
  displayName: 'VSHN - the DevOps Company',
});

export const organizationListNxtVshn = createOrganizationList({
  items: [
    createOrganization({
      name: 'nxt',
      displayName: 'nxt Engineering GmbH',
    }),
    createOrganization({
      name: 'vshn',
    }),
  ],
});

export const organizationListNxtVshnWithDisplayName = createOrganizationList({
  items: [
    createOrganization({
      name: 'nxt',
      displayName: 'nxt Engineering GmbH',
    }),
    createOrganization({
      name: 'vshn',
      displayName: 'VSHN AG',
    }),
  ],
});

export function createOrganization(organizationConfig: OrganizationConfig): Organization {
  let spec: OrganizationSpec = {};
  if (organizationConfig.displayName) {
    spec = {
      displayName: organizationConfig.displayName,
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

export function createOrganizationList(organizationListConfig: OrganizationListConfig): OrganizationList {
  return {
    kind: 'OrganizationList',
    apiVersion: 'organization.appuio.io/v1',
    metadata: {},
    items: organizationListConfig.items,
  };
}
