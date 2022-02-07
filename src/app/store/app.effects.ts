import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { loadZones, loadZonesFailure, loadZonesSuccess } from './app.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AppEffects {
  loadZones$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadZones),
      mergeMap(() =>
        this.kubernetesClientService.getZoneList().pipe(
          map((zoneList) => loadZonesSuccess({ zones: zoneList.items })),
          catchError((error: HttpErrorResponse) => of(loadZonesFailure({ error })))
        )
      )
    );
  });

  loadZonesFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(loadZonesFailure),
        tap(({ error }) => {
          this.messageService.add({
            severity: 'error',
            summary: $localize`Error`,
            detail: error.message,
          });
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService
  ) {}
}
