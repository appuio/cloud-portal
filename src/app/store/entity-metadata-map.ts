import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { Organization } from '../types/organization';

export const organizationEntityKey = 'Organization';

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
