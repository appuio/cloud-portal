import { Injectable } from '@angular/core';
import { Operation } from './kubernetes-data.service';
import { billingEntityEntityKey } from './entity-metadata-map';
import { QueryParams } from '@ngrx/data';

@Injectable({
  providedIn: 'root',
})
export class KubernetesUrlGenerator {
  protected readonly apiPrefix = 'appuio-api';
  protected knownEntities: Map<string, { apiVersion: string; kind: string }> = new Map<
    string,
    { apiVersion: string; kind: string }
  >();

  constructor() {
    this.knownEntities.set(billingEntityEntityKey, { apiVersion: 'billing.appuio.io/v1', kind: 'billingentities' });
  }

  getEntity(entityName: string, id: string, op: Operation): string {
    const meta = this.knownEntities.get(entityName);
    if (!meta) {
      throw new Error(`Entity "${entityName}" is not registered in the Kubernetes URL generator`);
    }
    const idSplit = this.splitID(id);
    if (idSplit.namespace && idSplit.namespace !== '') {
      // we have an ID that contains name + namespace.
      const base = `${this.apiPrefix}/apis/${meta.apiVersion}/namespaces/${idSplit.namespace}/${meta.kind}`;
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
    return `${this.apiPrefix}/apis/${meta.apiVersion}/${meta.kind}/${idSplit.name}`;
  }

  getEntityList(entityName: string, op: Operation, queryParams?: QueryParams | string): string {
    const meta = this.knownEntities.get(entityName);
    if (!meta) {
      throw new Error(`Entity "${entityName}" is not registered in the Kubernetes URL generator`);
    }

    if (queryParams && typeof queryParams !== 'string') {
      const namespace = queryParams['namespace'];
      if (namespace && namespace !== '') {
        delete queryParams['namespace'];
        // Scope the list to a specific namespace for namespace-scoped resources.
        return `${this.apiPrefix}/apis/${meta.apiVersion}/namespaces/${namespace}/${meta.kind}`;
      }
    }
    // all cluster-scoped objects, or objects from all namespaces.
    return `${this.apiPrefix}/apis/${meta.apiVersion}/${meta.kind}`;
  }

  protected splitID(id: string): { name: string; namespace?: string } {
    const arr = id.split('/');
    if (arr.length === 1) {
      return { name: arr[0] };
    }
    if (arr.length === 2) {
      return { name: arr[1], namespace: arr[0] };
    }
    throw new Error(`id is an invalid Kubernetes name, must be one of ["name", "namespace/name"], : ${id}`);
  }
}
