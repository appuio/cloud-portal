export interface Organization {
  kind: 'Organization';
  apiVersion: 'organization.appuio.io/v1';
  metadata: {
    name: string;
    [key: string]: unknown;
  };
  spec: {
    displayName: string;
  };
}

export interface OrganizationList {
  kind: 'OrganizationList';
  apiVersion: 'organization.appuio.io/v1';
  metadata: object;
  items: Organization[];
}