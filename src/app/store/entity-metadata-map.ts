import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { Organization } from '../types/organization';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';
import { OrganizationMembers } from '../types/organization-members';

export const organizationEntityKey = 'Organization';
export const organizationMembersEntityKey = 'OrganizationMembers';
export const selfSubjectAccessReviewEntityKey = 'SelfSubjectAccessReview';

const pluralNames = {};
export const entityMetadataMap: EntityMetadataMap = {
  Organization: {
    selectId: (org: Organization) => org.metadata.name,
    entityName: organizationEntityKey,
    sortComparer: (a: Organization, b: Organization) =>
      a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }),
    filterFn: (entities: Organization[], filterFn: (org: Organization) => boolean) => {
      return entities.filter((org) => filterFn(org));
    },
  },
  SelfSubjectAccessReview: {
    selectId: (ssar: SelfSubjectAccessReview) => composeSsarId(ssar),
    entityName: selfSubjectAccessReviewEntityKey,
  },
  OrganizationMembers: {
    entityName: organizationMembersEntityKey,
    selectId: (members: OrganizationMembers) => members.metadata.namespace,
    sortComparer: (a: OrganizationMembers, b: OrganizationMembers) =>
      a.metadata.namespace.localeCompare(b.metadata.namespace, undefined, { sensitivity: 'base' }),
    filterFn: (entities: OrganizationMembers[], filterFn: (members: OrganizationMembers) => boolean) => {
      return entities.filter((members) => filterFn(members));
    },
  },
};

export const entityConfig: EntityDataModuleConfig = {
  entityMetadata: entityMetadataMap,
  pluralNames,
};

export function composeSsarId(ssar: SelfSubjectAccessReview): string {
  return `${ssar.spec.resourceAttributes.group}/${ssar.spec.resourceAttributes.resource}/${
    ssar.spec.resourceAttributes.namespace ?? ''
  }/${ssar.spec.resourceAttributes.verb}`;
}

export function decomposeSsarId(key: string): { resource: string; group: string; namespace: string; verb: string } {
  const arr = key.split('/');
  if (arr.length === 4) {
    return {
      group: arr[0],
      resource: arr[1],
      namespace: arr[2],
      verb: arr[3],
    };
  }
  return { group: '', resource: '', namespace: '', verb: '' };
}
