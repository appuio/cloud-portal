import { Organization } from '../types/organization';

export function organizationNameFilter(name: string): (orgs: Organization[]) => Organization[] {
  return function (orgs) {
    return orgs.filter((org) => org.metadata.name === name);
  };
}

export function noFilter<T>(): (entities: T[]) => T[] {
  return function (entities) {
    return entities;
  };
}

export function firstInList<T>(): (entity: T[]) => T[] {
  return function (entities) {
    if (entities.length === 0) {
      return [];
    }
    return [entities[0]];
  };
}
