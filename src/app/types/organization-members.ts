import { KubeObject } from './entity';

export const OrganizationMembersPermissions = { group: 'appuio.io', resource: 'organizationmembers' };

export interface OrganizationMembers extends KubeObject {
  kind: 'OrganizationMembers';
  apiVersion: 'appuio.io/v1';
  spec: {
    userRefs?: {
      name: string;
    }[];
  };
}
