import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import * as OrganizationActions from './organization.actions';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { Verb } from '../../store/app.reducer';
import { loadOrganizations } from '../../store/app.actions';

@Injectable()
export class OrganizationEffects {
  loadOrganizations$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(OrganizationActions.loadOrganizations),
      concatMap(() =>
        this.kubernetesClientService.getOrganizationList().pipe(
          switchMap((organizationList) => {
            const organizations = organizationList.items;
            if (organizations.length === 0) {
              return of(OrganizationActions.loadOrganizationsSuccess({ organizations: organizations }));
            }
            const requests = [
              ...organizations.map((o) =>
                this.kubernetesClientService.getOrganizationMembersPermission(o.metadata.name)
              ),
              ...organizations.map((o) => this.kubernetesClientService.getOrganizationPermission(o.metadata.name)),
            ];
            return forkJoin(requests).pipe(
              map((verbs: Verb[][]) => {
                organizations.forEach((organization, index) => {
                  organization.viewMembers = verbs[index].includes(Verb.List);
                  organization.editOrganization = verbs[index + organizations.length].includes(Verb.Update);
                });
                return OrganizationActions.loadOrganizationsSuccess({ organizations: organizations });
              })
            );
          }),
          catchError((error) => of(OrganizationActions.loadOrganizationsFailure({ errorMessage: error.message })))
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
          // eslint-disable-next-line ngrx/no-multiple-actions-in-effects
          mergeMap((organization) => [
            OrganizationActions.saveOrganizationSuccess({ organization }),
            loadOrganizations(),
          ]),
          catchError((error) => of(OrganizationActions.saveOrganizationFailure({ error: error.error })))
        )
      )
    );
  });

  constructor(private actions$: Actions, private kubernetesClientService: KubernetesClientService) {}
}
