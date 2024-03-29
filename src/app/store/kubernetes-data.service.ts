import { EntityCollectionDataService, QueryParams } from '@ngrx/data';
import { KubeObject } from '../types/entity';
import { map, Observable } from 'rxjs';
import { Update } from '@ngrx/entity';
import { HttpClient, HttpParams } from '@angular/common/http';
import { KubernetesUrlGenerator } from './kubernetes-url-generator.service';
import { Injectable } from '@angular/core';

export declare type HttpMethods = 'DELETE' | 'GET' | 'POST' | 'PUT' | 'PATCH';

export class KubernetesDataService<T extends KubeObject> implements EntityCollectionDataService<T> {
  protected _name: string;

  constructor(
    entityName: string,
    protected http: HttpClient,
    protected urlGenerator: KubernetesUrlGenerator
  ) {
    this._name = entityName;
  }

  get name(): string {
    return this._name;
  }

  getWithQuery(params: QueryParams | string): Observable<T[]> {
    const url = this.urlGenerator.getEntityList(this.name, params);
    let p = params;
    if (typeof params !== 'string') {
      // Since the EntityCollectionDataService doesn't support path parameter out-of-the-box,
      //  we include the namespace in the query parameter, but remove it before requesting, as this is actually a path parameter.
      const clone = Object.assign({}, params);
      delete clone['namespace'];
      p = clone;
    }
    return this.executeCollection('GET', url, p);
  }

  upsert(entity: T): Observable<T> {
    if (entity.metadata.creationTimestamp) {
      return this.execute(
        'PATCH',
        this.urlGenerator.getEntity(this.name, buildId(entity.metadata.name, entity.metadata.namespace), 'PATCH'),
        entity
      );
    }
    return this.add(entity);
  }

  add(entity: T): Observable<T> {
    return this.execute(
      'POST',
      this.urlGenerator.getEntity(this.name, buildId(entity.metadata.name, entity.metadata.namespace), 'POST'),
      entity
    );
  }

  delete(id: number | string): Observable<number | string> {
    return this.execute('DELETE', this.urlGenerator.getEntity(this.name, id.toString(), 'DELETE')).pipe(
      // actually we get a reply from Kubernetes with a status object here, but the interface wants us to return the original entity id 🤷
      map(() => id)
    );
  }

  /**
   *   Gets all entities across the cluster.
   *   Note: This doesn't work for namespaced collections.
   *   For namespaced collections, use "getWithQuery" and set the "namespace" parameter.
   */
  getAll(): Observable<T[]> {
    return this.executeCollection('GET', this.urlGenerator.getEntityList(this.name, 'GET'));
  }

  getById(id: string): Observable<T> {
    return this.execute('GET', this.urlGenerator.getEntity(this.name, id, 'GET'));
  }

  update(update: Update<T>): Observable<T> {
    const entity = update.changes as T;
    return this.execute('PATCH', this.urlGenerator.getEntity(this.name, update.id.toString(), 'PATCH'), entity);
  }

  protected executeCollection(method: HttpMethods, url: string, queryParams?: QueryParams | string): Observable<T[]> {
    const qParams = typeof queryParams === 'string' ? { fromString: queryParams } : { fromObject: queryParams };
    const params = new HttpParams(qParams);
    switch (method) {
      case 'GET': {
        return this.http
          .get<{ items: T[] }>(url, { params: params, responseType: 'json' })
          .pipe(map((list) => list.items));
      }
      default: {
        throw new Error(`Unimplemented HTTP method for collections: ${method}`);
      }
    }
  }

  protected execute(method: HttpMethods, url: string, data?: T, queryParams?: QueryParams | string): Observable<T> {
    const qParams = typeof queryParams === 'string' ? { fromString: queryParams } : { fromObject: queryParams };
    const params = new HttpParams(qParams);
    switch (method) {
      case 'DELETE': {
        return this.http.delete<T>(url, { params, responseType: 'json' });
      }
      case 'GET': {
        return this.http.get<T>(url, { params, responseType: 'json' });
      }
      case 'POST': {
        return this.http.post<T>(url, data, { params, responseType: 'json' });
      }
      case 'PUT': {
        return this.http.put<T>(url, data, { params, responseType: 'json' });
      }
      case 'PATCH': {
        return this.http.patch<T>(url, data, {
          params,
          responseType: 'json',
          headers: { 'content-type': 'application/merge-patch+json' },
        });
      }
      default: {
        throw new Error(`Unimplemented HTTP method: ${method}`);
      }
    }
  }
}

export function buildId(name: string, namespace?: string): string {
  if (namespace && namespace !== '') {
    return `${namespace}/${name}`;
  }
  return name;
}

export function splitID(id: string): { name: string; namespace?: string } {
  const arr = id.split('/');
  if (arr.length === 1) {
    return { name: arr[0] };
  }
  if (arr.length === 2) {
    return { name: arr[1], namespace: arr[0] };
  }
  throw new Error(`id is an invalid Kubernetes name, must be one of ["name", "namespace/name"], : ${id}`);
}

@Injectable()
export class KubernetesDataServiceFactory {
  constructor(
    protected http: HttpClient,
    protected urlGenerator: KubernetesUrlGenerator
  ) {}

  create<T extends KubeObject>(entityName: string): EntityCollectionDataService<T> {
    return new KubernetesDataService<T>(entityName, this.http, this.urlGenerator);
  }
}
