import { KubeObject } from './entity';

export const OrganizationPermissions = { group: 'organization.appuio.io', resource: 'organizations' };

export interface OrganizationSpec {
  displayName?: string;
  billingEntityRef?: string;
}

export interface Organization extends KubeObject {
  kind: 'Organization';
  apiVersion: 'organization.appuio.io/v1';
  spec: OrganizationSpec;
  status?: OrganizationStatus;
}

export interface OrganizationStatus {
  billingEntityName?: string;
}

export function newOrganization(name: string, displayName: string, billingEntityRef: string): Organization {
  return {
    kind: 'Organization',
    apiVersion: 'organization.appuio.io/v1',
    metadata: {
      name: name,
    },
    spec: {
      displayName: displayName,
      billingEntityRef: billingEntityRef,
    },
  };
}
