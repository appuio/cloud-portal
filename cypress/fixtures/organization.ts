import { Organization, OrganizationSpec } from '../../src/app/types/organization';

export interface OrganizationConfig {
  name: string;
  displayName?: string;
}

export const organizationVshn = createOrganization({
  name: 'vshn',
  displayName: 'VSHN - the DevOps Company',
});

export const organizationListNxtVshn = {
  items: [
    createOrganization({
      name: 'nxt',
      displayName: 'nxt Engineering GmbH',
    }),
    createOrganization({
      name: 'vshn',
    }),
  ],
};

export const organizationListNxtVshnWithDisplayName = {
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
};

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
