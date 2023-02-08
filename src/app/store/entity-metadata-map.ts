import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { Organization } from '../types/organization';

export const organizationEntityKey = 'Organization';

const pluralNames = {};
export const entityMetadataMap: EntityMetadataMap = {
  Organization: {
    selectId: (org: Organization) => org.metadata.name,
    entityName: organizationEntityKey,
  },
};

export const entityConfig: EntityDataModuleConfig = {
  entityMetadata: entityMetadataMap,
  pluralNames,
};
