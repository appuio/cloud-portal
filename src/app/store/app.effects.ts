import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { setOrganizationSelectionEnabled } from './app.actions';
import { map } from 'rxjs';
import { selectRouteData } from './router.selectors';
import { Store } from '@ngrx/store';
import { routerNavigatedAction } from '@ngrx/router-store';

@Injectable()
export class AppEffects {
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
    private store: Store
  ) {}
}
