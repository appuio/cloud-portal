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
      name: 'members',
    },
    spec: {
      userRefs: organizationMembersConfig.userRefs,
    },
  };
}

export function setOrganizationMembers(cy: Cypress.cy, namespace: string, ...members: string[]): void {
  cy.intercept('GET', `appuio-api/apis/appuio.io/v1/namespaces/${namespace}/organizationmembers/members`, {
    body: createOrganizationMembers({
      namespace,
      userRefs: members.map((member) => {
        return { name: member };
      }),
    }),
  }).as(`organizationMembersGet-${namespace}`);
}
