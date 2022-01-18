import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {KubernetesClientService} from "../kubernetes-client.service";
import {loadZones, setZones} from "./app.actions";
import {catchError, EMPTY, map, mergeMap} from "rxjs";


@Injectable()
export class AppEffects {

  loadZones$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(loadZones),
        mergeMap(() => this.kubernetesClientService.getZoneList()
          .pipe(
            map(zoneList => setZones({zones: zoneList.items})),
            catchError(() => EMPTY)
          ))
      );
    }
  );

  constructor(private actions$: Actions,
              private kubernetesClientService: KubernetesClientService) {
  }

}
