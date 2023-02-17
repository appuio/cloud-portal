import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import {
  loadUser,
  loadUserFailure,
  loadUserSuccess,
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  saveUserPreferences,
  saveUserPreferencesFailure,
  saveUserPreferencesSuccess,
  setOrganizationSelectionEnabled,
} from './app.actions';
import { catchError, filter, map, mergeMap, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { concatMap, switchMap } from 'rxjs/operators';
import { selectRouteData } from './router.selectors';
import { Store } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';
import { selectUser } from './app.selectors';
import { EntityState } from '../types/entity';
import { User } from '../types/user';
import { loadTeamsFailure } from '../teams/store/team.actions';
import { OrganizationCollectionService } from './organization-collection.service';
import { organizationNameFilter } from './entity-filter';

@Injectable()
export class AppEffects {
  loadZones$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadZones),
      mergeMap(() =>
        this.kubernetesClientService.getZoneList().pipe(
          map((zoneList) => loadZonesSuccess({ zones: zoneList.items })),
          catchError((error: HttpErrorResponse) => of(loadZonesFailure({ errorMessage: error.message })))
        )
      )
    );
  });

  loadZonesFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(loadZonesFailure, loadUserFailure, loadTeamsFailure),
        tap(({ errorMessage }) => {
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail: errorMessage,
          });
        })
      );
    },
    { dispatch: false }
  );

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUser),
      concatMap(({ username }) => {
        return this.kubernetesClientService.getUser(username).pipe(
          tap((user) => {
            // this is the link between @ngrx/data and older custom ngrx reducers
            const defaultOrg = user.spec.preferences?.defaultOrganizationRef ?? '';
            if (defaultOrg !== '') {
              this.organizationService.setFilter(organizationNameFilter(defaultOrg));
            }
          }),
          map((user) => loadUserSuccess({ user })),
          catchError((error) => of(loadUserFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  saveUserPreferences$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveUserPreferences),
      concatLatestFrom(() => this.store.select(selectUser)),
      filter(([, userEntity]) => userEntity.state === EntityState.Loaded),
      concatMap(([userPreferences, userEntity]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.kubernetesClientService.getUser(userEntity.value!.metadata.name).pipe(
          switchMap((user) => {
            const updatedUser: User = {
              kind: 'User',
              apiVersion: 'appuio.io/v1',
              metadata: {
                name: user.metadata.name,
                resourceVersion: user.metadata.resourceVersion,
              },
              spec: {
                ...user.spec,
                preferences: {
                  ...user.spec.preferences,
                  defaultOrganizationRef: userPreferences.defaultOrganizationRef,
                },
              },
            };
            return this.kubernetesClientService.updateUser(updatedUser).pipe(
              map((user) => saveUserPreferencesSuccess({ user })),
              catchError((error) => of(saveUserPreferencesFailure({ errorMessage: error.message })))
            );
          })
        );
      })
    );
  });

  saveUserPreferencesSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveUserPreferencesSuccess),
      switchMap((user) => of(loadUserSuccess(user)))
    );
  });

  selectRouteData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      concatLatestFrom(() => this.store.select(selectRouteData)),
      map(([, routerData]) =>
        setOrganizationSelectionEnabled({
          organizationSelectionEnabled: routerData['organizationSelectionEnabled'],
        })
      )
    );
  });

  constructor(
    private actions$: Actions,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService,
    private store: Store,
    private organizationService: OrganizationCollectionService
  ) {}
}
