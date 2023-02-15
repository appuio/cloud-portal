import { EntityCollectionDataService, HttpMethods, QueryParams } from '@ngrx/data';
import { KubeObject } from '../types/entity';
import { map, Observable } from 'rxjs';
import { Update } from '@ngrx/entity';
import { HttpClient, HttpParams } from '@angular/common/http';
import { KubernetesUrlGenerator } from './kubernetes-url-generator.service';

export declare type Operation = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

export class KubernetesDataService<T extends KubeObject> implements EntityCollectionDataService<T> {
  protected _name: string;

  constructor(entityName: string, protected http: HttpClient, protected urlGenerator: KubernetesUrlGenerator) {
    this._name = entityName;
  }

  get name(): string {
    return this._name;
  }

  getWithQuery(params: QueryParams | string): Observable<T[]> {
    return this.executeCollection('GET', this.urlGenerator.getEntityList(this.name, 'READ', params), params);
  }

  upsert(entity: T): Observable<T> {
    throw new Error('not implemented in Kubernetes');
  }

  add(entity: T): Observable<T> {
    return this.execute('POST', this.urlGenerator.getEntity(this.name, this.buildId(entity), 'CREATE'));
  }

  delete(id: number | string): Observable<number | string> {
    return this.execute('DELETE', this.urlGenerator.getEntity(this.name, id.toString(), 'DELETE')).pipe(
      map((t) => t.metadata.name)
    );
  }

  /*
  Gets all entities across the cluster.
  Note: This doesn't work for namespaced collections.
  For namespaced collections, use "getWithQuery" and set the "namespace" parameter.
  */
  getAll(): Observable<T[]> {
    return this.executeCollection('GET', this.urlGenerator.getEntityList(this.name, 'READ'));
  }

  getById(id: string): Observable<T> {
    return this.execute('GET', this.urlGenerator.getEntity(this.name, id, 'READ'));
  }

  update(update: Update<T>): Observable<T> {
    const entity = update.changes as T;
    return this.execute('PUT', this.urlGenerator.getEntity(this.name, update.id.toString(), 'UPDATE'), entity);
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

  protected execute(method: HttpMethods, url: string, data?: T): Observable<T> {
    switch (method) {
      case 'DELETE': {
        return this.http.delete<T>(url);
      }
      case 'GET': {
        return this.http.get<T>(url);
      }
      case 'POST': {
        return this.http.post<T>(url, data);
      }
      case 'PUT': {
        return this.http.put<T>(url, data);
      }
      default: {
        throw new Error(`Unimplemented HTTP method: ${method}`);
      }
    }
  }

  protected buildId(entity: T): string {
    let id = entity.metadata.name;
    if (entity.metadata.namespace) {
      id = `${entity.metadata.namespace}/${entity.metadata.name}`;
    }
    return id;
  }
}
