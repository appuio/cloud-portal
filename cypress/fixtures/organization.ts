import { Organization, OrganizationList } from '../../src/app/types/organization';

export interface OrganizationConfig {
  name: string;
  displayName: string;
  viewMembers?: boolean;
  editOrganization?: boolean;
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
      displayName: 'VSHN AG',
    }),
  ],
});

export function createOrganization(organizationConfig: OrganizationConfig): Organization {
  return {
    kind: 'Organization',
    apiVersion: 'organization.appuio.io/v1',
    metadata: {
      name: organizationConfig.name,
    },
    spec: {
      displayName: organizationConfig.displayName,
    },
    viewMembers: organizationConfig.viewMembers,
    editOrganization: organizationConfig.editOrganization,
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
