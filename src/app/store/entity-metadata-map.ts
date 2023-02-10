import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { Organization } from '../types/organization';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';

export const organizationEntityKey = 'Organization';
export const selfSubjectAccessReviewEntityKey = 'SelfSubjectAccessReview';

const pluralNames = {};
export const entityMetadataMap: EntityMetadataMap = {
  Organization: {
    selectId: (org: Organization) => org.metadata.name,
    entityName: organizationEntityKey,
    sortComparer: (a, b) => a.metadata.name.localeCompare(b.metadata.name, undefined, { sensitivity: 'base' }),
    filterFn: (entities: Organization[], filterFn: (org: Organization) => boolean) => {
      return entities.filter((org) => filterFn(org));
    },
  },
  SelfSubjectAccessReview: {
    selectId: (ssar: SelfSubjectAccessReview) => composeSsarId(ssar),
    entityName: selfSubjectAccessReviewEntityKey,
  },
};

export const entityConfig: EntityDataModuleConfig = {
  entityMetadata: entityMetadataMap,
  pluralNames,
};

export function organizationNameFilter(name: string): (org: Organization) => boolean {
  return function (org) {
    return org.metadata.name === name;
  };
}

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
