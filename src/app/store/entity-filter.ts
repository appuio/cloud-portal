import { KubeObject } from '../types/entity';

export function metadataNameFilter(metadataName: string): (entities: KubeObject[]) => KubeObject[] {
  return function (entities) {
    return entities.filter((entity) => entity.metadata.name === metadataName);
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

export function getBillingEntityFromClusterRoleName(clusterRoleName: string): string {
  return clusterRoleName.replace('billingentities-', '').replace('-viewer', '').replace('-admin', '');
}
