import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

import * as OrganizationActions from './organization.actions';
import { KubernetesClientService } from '../../core/kubernetes-client.service';

@Injectable()
export class OrganizationEffects {
  loadOrganizations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrganizationActions.loadOrganizations),
      concatMap(() =>
        this.kubernetesClientService.getOrganizationList().pipe(
          map((organizationList) =>
            OrganizationActions.loadOrganizationsSuccess({ organizations: organizationList.items })
          ),
          catchError((error) => of(OrganizationActions.loadOrganizationsFailure({ error })))
        )
      )
    );
  });

  saveOrganization$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrganizationActions.saveOrganization),
      concatMap(({ organization, isNew }) =>
        (isNew
          ? this.kubernetesClientService.addOrganization(organization)
          : this.kubernetesClientService.updateOrganization(organization)
        ).pipe(
          map((organization) => OrganizationActions.saveOrganizationsSuccess({ organization })),
          catchError((error) =>
            of(OrganizationActions.saveOrganizationsFailure({ error: error.error.message ?? error.message }))
          )
        )
      )
    );
  });

  constructor(private actions$: Actions, private kubernetesClientService: KubernetesClientService) {}
}
