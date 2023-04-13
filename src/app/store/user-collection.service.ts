import { Injectable } from '@angular/core';
import { KubernetesCollectionService } from './kubernetes-collection.service';
import { User } from '../types/user';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { userEntityKey } from './entity-metadata-map';
import { filter, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserCollectionService extends KubernetesCollectionService<User> {
  currentUser$: Observable<User>;

  constructor(elementsFactory: EntityCollectionServiceElementsFactory) {
    super(userEntityKey, elementsFactory);

    this.currentUser$ = this.filteredEntities$.pipe(
      filter((users) => users.length > 0),
      map((users) => users[0])
    );
  }

  newUser(userName: string): User {
    return {
      kind: 'User',
      apiVersion: 'appuio.io/v1',
      metadata: {
        name: userName,
      },
      spec: {},
    };
  }
}
