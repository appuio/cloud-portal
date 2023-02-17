import { EntityActionOptions, EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { KubeObject } from '../types/entity';
import { Observable, of, take } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { buildId } from './kubernetes-data.service';
import { Injectable } from '@angular/core';

export class KubernetesCollectionService<T extends KubeObject> extends EntityCollectionServiceBase<T> {
  constructor(entityName: string, private serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(entityName, serviceElementsFactory);
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
        return super.getByKey(key, options);
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
    return this.loaded$.pipe(
      switchMap((isLoaded) => {
        if (isLoaded) {
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
    return this.getWithQuery({ namespace: namespace }, options);
  }
}

@Injectable()
export class KubernetesCollectionServiceFactory {
  constructor(protected entityCollectionServiceElementsFactory: EntityCollectionServiceElementsFactory) {}

  create<T extends KubeObject>(entityName: string): KubernetesCollectionService<T> {
    return new KubernetesCollectionService(entityName, this.entityCollectionServiceElementsFactory);
  }
}
