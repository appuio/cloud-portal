import { KubeObject } from '../types/entity';

export function metadataNameFilter<T extends KubeObject>(
  metadataName: string,
  defaultFn?: (entities: T[]) => T[]
): (entities: T[]) => T[] {
  return function (entities) {
    const entity = entities.find((e) => e.metadata.name === metadataName);
    if (entity) {
      return [entity];
    }
    return defaultFn ? defaultFn(entities) : entities.filter((e) => e.metadata.name === metadataName);
  };
}

export function firstInList<T>(): (entities: T[]) => T[] {
  return function (entities) {
    if (entities.length === 0) {
      return [];
    }
    return [entities[0]];
  };
}

export function getBillingEntityFromClusterRoleName(clusterRoleName: string): string {
  return clusterRoleName.replace('billingentities-', '').replace('-viewer', '').replace('-admin', '');
}
