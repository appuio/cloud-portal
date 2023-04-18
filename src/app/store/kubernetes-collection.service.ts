import {
  DataServiceError,
  EntityActionOptions,
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
  QueryParams,
} from '@ngrx/data';
import { KubeObject } from '../types/entity';
import { filter, map, Observable, ObservableInput, of, take, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { buildId } from './kubernetes-data.service';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export class KubernetesCollectionService<T extends KubeObject> extends EntityCollectionServiceBase<T> {
  // this flag holds the value true when there was an initial collection load.
  // Ideally this can be done with rxJS, but it's not easy to accomplish this if there is no initial QUERY_ALL action dispatched.
  private memoizedAllEntities = false;
  private memoizedAllPerNamespace = new Map<string, boolean>();

  constructor(entityName: string, private serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(entityName, serviceElementsFactory);
  }

  /**
   * resetMemoization causes all {@link getByKeyMemoized}, {@link getAllMemoized} and {@link getAllInNamespaceMemoized} to cause data to be loaded from remote storage again.
   * @param namespace if set, it will only reset memoization in the given namespace.
   */
  resetMemoization(namespace?: string): void {
    if (namespace) {
      this.memoizedAllPerNamespace.set(namespace, false);
    } else {
      this.memoizedAllPerNamespace.clear();
      this.memoizedAllEntities = false;
    }
  }

  override getAll(options?: EntityActionOptions): Observable<T[]> {
    return super.getAll(options).pipe(tap(() => (this.memoizedAllEntities = true)));
  }

  override getWithQuery(queryParams: QueryParams | string, options?: EntityActionOptions): Observable<T[]> {
    const pipe = super.getWithQuery(queryParams, options);
    if (typeof queryParams !== 'string' && 'namespace' in queryParams) {
      const ns = queryParams['namespace'] as string;
      return pipe.pipe(tap(() => this.memoizedAllPerNamespace.set(ns, true)));
    }
    return pipe;
  }

  /**
   * Returns the entity identified by key from the cache if it exists.
   * If it doesn't it returns the result of {@link getByKey}.
   * @param key the "name" or "namespace/name" of a Kubernetes resource.
   * @param options options that influence merge behavior.
   * @returns Observable of the queried entity after server reports successful query or the query error.
   */
  public getByKeyMemoized(key: string, options?: EntityActionOptions): Observable<T> {
    return this.entities$.pipe(
      take(1),
      switchMap((entities: T[]) => {
        const entity = entities.find((entity) => {
          const entityId = buildId(entity.metadata.name, entity.metadata.namespace);
          return entityId === key;
        });
        if (entity) {
          return of(entity);
        }
        return this.getByKey(key, options);
      })
    );
  }

  /**
   * Emits the entity identified by key and all its updates from the cache.
   * If the entity initially doesn't exist, it will be queried from remote API.
   * To trigger an update, call any of the other methods on this class that update the entity collection cache.
   * Updates are only emitted if the `.metadata.resourceVersion` has changed to filter unrelated changes occurring in the collection.
   * @param key
   * @param options
   * @returns Continuous Observable of the queried entity
   */
  public streamByKeyMemoized(key: string, options?: EntityActionOptions): Observable<T> {
    return this.getByKeyMemoized(key, options).pipe(
      switchMap((existing) => {
        let resourceVersion = existing.metadata.resourceVersion ?? '';
        return this.entities$.pipe(
          map(
            (entities) =>
              entities.find((entity) => buildId(entity.metadata.name, entity.metadata.namespace) === key) as T
          ),
          filter((entity) => {
            if (!entity) {
              return false;
            }
            const hasChanged = resourceVersion !== entity.metadata.resourceVersion;
            resourceVersion = entity.metadata.resourceVersion ?? '';
            return hasChanged;
          })
        );
      })
    );
  }

  /**
   * Returns all entities from the cache if it has been loaded before.
   * If it hasn't been loaded yet, it dispatches an action to query remote storage as in {@link EntityCollectionServiceBase.getAll}.
   * @param options options that influence merge behavior.
   * @returns Observable of the queried entities after server reports successful query or the query error.
   */
  public getAllMemoized(options?: EntityActionOptions): Observable<T[]> {
    return this.entities$.pipe(
      take(1),
      switchMap(() => {
        if (this.memoizedAllEntities) {
          return this.entities$.pipe(take(1));
        }
        return this.getAll(options);
      })
    );
  }

  /**
   * Like {@link getAllMemoized}, but doesn't terminate the Observable.
   * Any update to the entity cache emits the whole collection.
   */
  public streamAllMemoized(options?: EntityActionOptions): Observable<T[]> {
    return this.getAllMemoized(options).pipe(
      switchMap(() => {
        return this.entities$;
      })
    );
  }

  /**
   * Dispatches an action to get all entities from a specific Kubernetes namespace and merges the result into the cache.
   * @param namespace to get the entities from.
   * @param options options that influence merge behavior.
   * @returns Observable of the queried entities after server reports successful query or the query error.
   */
  public getAllInNamespace(namespace: string, options?: EntityActionOptions): Observable<T[]> {
    return this.getWithQuery({ namespace }, options);
  }

  /**
   * Returns all entities from the cache from a particular namespace if it has been loaded before.
   * @param namespace the Kubernetes namespace in which to look for entities.
   * @param options options that influence merge behaviour.
   * @returns Observable of the queried namespace-scoped entities after server reports successful query or the query error.
   */
  public getAllInNamespaceMemoized(namespace: string, options?: EntityActionOptions): Observable<T[]> {
    return this.entities$.pipe(
      take(1),
      switchMap(() => {
        if (this.memoizedAllPerNamespace.get(namespace) === true) {
          return this.entities$.pipe(map((entities) => entities.filter((e) => e.metadata.namespace === namespace)));
        }
        return this.getAllInNamespace(namespace, options);
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class KubernetesCollectionServiceFactory<T extends KubeObject> {
  protected knownCollectionServices: Map<string, KubernetesCollectionService<T>> = new Map<
    string,
    KubernetesCollectionService<T>
  >();
  constructor(protected entityCollectionServiceElementsFactory: EntityCollectionServiceElementsFactory) {}

  create(entityName: string): KubernetesCollectionService<T> {
    let knownService = this.knownCollectionServices.get(entityName);
    if (knownService) {
      return knownService;
    }
    knownService = new KubernetesCollectionService(entityName, this.entityCollectionServiceElementsFactory);
    this.knownCollectionServices.set(entityName, knownService);
    return knownService;
  }
}

/**
 * This is an error handler that returns a default value if the error is a 404.
 * Use it in a pipe like following:
 *  `getByKey(<key>).pipe(catchError(defaultIfNotFound(<default>)))`
 * @param def the default value to return if the error is a 404.
 * @return function to be used in a `catchError` operator.
 */
export function defaultIfNotFound<T>(def: T): (err: DataServiceError, caught: Observable<T>) => ObservableInput<T> {
  return defaultIfStatusCode(def, [404]);
}

/**
 * This is an error handler that returns a default value if the error contains one of the given HTTP status codes.
 * Use it in a pipe like following:
 *  `getByKey(<key>).pipe(catchError(defaultIfStatusCode(<default>, [401, 403])))`
 * @param def the default value to return if the error's status code is included in `statusCodes`.
 * @param statusCodes list of HTTP status codes which cause the handler to return the default value.
 * @return function to be used in a `catchError` operator.
 */
export function defaultIfStatusCode<T>(
  def: T,
  statusCodes: number[]
): (err: DataServiceError, caught: Observable<T>) => ObservableInput<T> {
  if (statusCodes.length === 0) {
    throw new Error('at least 1 status code is required');
  }
  return (err: DataServiceError) => {
    if (err.error instanceof HttpErrorResponse && statusCodes.includes(err.error.status)) {
      return of(def);
    }
    throw err;
  };
}
