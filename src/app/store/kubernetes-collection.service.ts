import {
  EntityActionOptions,
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
  QueryParams,
} from '@ngrx/data';
import { KubeObject } from '../types/entity';
import { map, Observable, of, take, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { buildId } from './kubernetes-data.service';
import { Injectable } from '@angular/core';

export class KubernetesCollectionService<T extends KubeObject> extends EntityCollectionServiceBase<T> {
  // this flag holds the value true when there was an initial collection load.
  // Ideally this can be done with rxJS, but it's not easy to accomplish this if there is no initial QUERY_ALL action dispatched.
  private memoizedAllEntities = false;
  private memoizedAllPerNamespace = new Map<string, boolean>();

  constructor(entityName: string, private serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(entityName, serviceElementsFactory);
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
   * @returns Observable of the queried entities after server reports successful query or the query error.
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
          return this.entities$;
        }
        return this.getAll(options);
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
        if (this.memoizedAllPerNamespace.get(namespace)) {
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
