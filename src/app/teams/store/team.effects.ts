import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import {
  deleteTeam,
  deleteTeamFailure,
  deleteTeamSuccess,
  loadTeamPermissions,
  loadTeamPermissionsFailure,
  loadTeamPermissionsSuccess,
  loadTeams,
  loadTeamsFailure,
  loadTeamsSuccess,
} from './team.actions';
import { selectFocusOrganizationName } from '../../store/app.selectors';
import { Store } from '@ngrx/store';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { catchError, map, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable()
export class TeamEffects {
  loadTeams$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadTeams),
      concatLatestFrom(() => this.store.select(selectFocusOrganizationName)),
      concatMap(([, organizationName]) => {
        if (!organizationName) {
          return of(loadTeamsSuccess({ teams: [] }));
        }
        return this.kubernetesClientService.getTeamList(organizationName).pipe(
          map((teamList) => loadTeamsSuccess({ teams: teamList.items })),
          catchError((error) => of(loadTeamsFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  loadTeamPermissions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadTeamPermissions),
      concatLatestFrom(() => this.store.select(selectFocusOrganizationName)),
      concatMap(([, organizationName]) => {
        if (!organizationName) {
          return of(loadTeamPermissionsSuccess({ verbs: [] }));
        }
        return this.kubernetesClientService.getTeamsPermission(organizationName).pipe(
          map((verbs) => loadTeamPermissionsSuccess({ verbs })),
          catchError((error) => of(loadTeamPermissionsFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteTeam$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteTeam),
      concatLatestFrom(() => this.store.select(selectFocusOrganizationName)),
      concatMap(([{ name }, organizationName]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.kubernetesClientService.deleteTeam(organizationName!, name).pipe(
          map(() => deleteTeamSuccess({ name })),
          catchError((error) => of(deleteTeamFailure({ errorMessage: error.message })))
        );
      })
    );
  });

  deleteTeamFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(deleteTeamFailure),
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

  constructor(
    private actions$: Actions,
    private store: Store,
    private kubernetesClientService: KubernetesClientService,
    private messageService: MessageService
  ) {}
}
