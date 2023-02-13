import { Organization } from '../types/organization';
import { OrganizationMembers } from '../types/organization-members';

export function organizationNameFilter(name: string): (org: Organization) => boolean {
  return function (org) {
    return org.metadata.name === name;
  };
}

export function memberNameFilter(name: string): (members: OrganizationMembers) => boolean {
  return function (members) {
    return members.metadata.namespace === name;
  };
}
