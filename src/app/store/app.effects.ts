import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import {
  loadOrganizations,
  loadOrganizationsFailure,
  loadOrganizationsSuccess,
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
        ofType(loadZonesFailure),
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

  loadOrganizations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadOrganizations),
      concatMap(() => {
        return this.kubernetesClientService.getOrganizationList().pipe(
          map((organizationList) => loadOrganizationsSuccess({ organizations: organizationList.items })),
          catchError((error) => of(loadOrganizationsFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUser),
      concatMap(({ username }) => {
        return this.kubernetesClientService.getUser(username).pipe(
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
        const user = userEntity.value!;
        const updatedUser = {
          ...user,
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
    private store: Store
  ) {}
}
