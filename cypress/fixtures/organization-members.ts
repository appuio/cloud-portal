import { UserRef } from '../../src/app/types/team';
import { OrganizationMembers } from '../../src/app/types/organization-members';

export interface OrganizationMembersConfig {
  namespace: string;
  userRefs: UserRef[];
}

export function createOrganizationMembers(organizationMembersConfig: OrganizationMembersConfig): OrganizationMembers {
  return {
    kind: 'OrganizationMembers',
    apiVersion: 'appuio.io/v1',
    metadata: {
      namespace: organizationMembersConfig.namespace,
      name: '',
    },
    spec: {
      userRefs: organizationMembersConfig.userRefs,
    },
  };
}
