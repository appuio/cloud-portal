export interface OrganizationSpec {
  displayName?: string;
}

export interface Organization {
  kind: 'Organization';
  apiVersion: 'organization.appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  spec: OrganizationSpec;
}

export interface OrganizationList {
  kind: 'OrganizationList';
  apiVersion: 'organization.appuio.io/v1';
  metadata: object;
  items: Organization[];
}

export function newOrganization(name: string, displayName: string): Organization {
  return {
    kind: 'Organization',
    apiVersion: 'organization.appuio.io/v1',
    metadata: {
      name: name,
    },
    spec: {
      displayName: displayName,
    },
  };
}
