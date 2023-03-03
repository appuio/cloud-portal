import { Injectable } from '@angular/core';
import { Operation, splitID } from './kubernetes-data.service';
import { QueryParams } from '@ngrx/data';

export const apiPrefix = 'appuio-api';

@Injectable({
  providedIn: 'root',
})
export class KubernetesUrlGenerator {
  protected knownEntities: Map<string, { apiVersion: string; kind: string }> = new Map<
    string,
    { apiVersion: string; kind: string }
  >();

  getEntity(entityName: string, id: string, op: Operation): string {
    const meta = this.getKubeObjectMeta(entityName);
    if (!meta) {
      throw new Error(`Entity "${entityName}" is not registered in the Kubernetes URL generator`);
    }
    const idSplit = splitID(id);
    if (idSplit.namespace && idSplit.namespace !== '') {
      // we have an ID that contains name + namespace.
      const base = `${apiPrefix}/apis/${meta.apiVersion}/namespaces/${idSplit.namespace}/${meta.kind}`;
      switch (op) {
        case 'CREATE': {
          return base; // the name is not part of the endpoint for new objects, but in the payload.
        }
        default: {
          return `${base}/${idSplit.name}`;
        }
      }
    }
    // this case is for cluster-scoped resources.
    const base = `${apiPrefix}/apis/${meta.apiVersion}/${meta.kind}`;
    switch (op) {
      case 'CREATE': {
        return base; // the name is not part of the endpoint for new objects, but in the payload.
      }
      default: {
        return `${base}/${idSplit.name}`;
      }
    }
  }

  getEntityList(entityName: string, op: Operation, queryParams?: QueryParams | string): string {
    const meta = this.getKubeObjectMeta(entityName);
    if (!meta) {
      throw new Error(`Entity "${entityName}" is not registered in the Kubernetes URL generator`);
    }

    if (queryParams && typeof queryParams !== 'string') {
      const namespace = queryParams['namespace'];
      if (namespace && namespace !== '') {
        // Scope the list to a specific namespace for namespace-scoped resources.
        return `${apiPrefix}/apis/${meta.apiVersion}/namespaces/${namespace}/${meta.kind}`;
      }
    }
    // all cluster-scoped objects, or objects from all namespaces.
    return `${apiPrefix}/apis/${meta.apiVersion}/${meta.kind}`;
  }

  protected getKubeObjectMeta(entityName: string): { apiVersion: string; kind: string } {
    let meta = this.knownEntities.get(entityName);
    if (meta) {
      return meta;
    }
    const arr = entityName.split('/');
    if (arr.length !== 3) {
      throw new Error(`invalid entity name given, must be formatted like "group/version/kind": ${entityName}`);
    }
    meta = {
      apiVersion: `${arr[0]}/${arr[1]}`,
      kind: arr[2],
    };
    this.knownEntities.set(entityName, meta);
    return meta;
  }
}
