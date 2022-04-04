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
  setOrganizationSelectionEnabled,
} from './app.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { concatMap } from 'rxjs/operators';
import { selectRouteData } from './router.selectors';
import { Store } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';

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
