import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Team } from '../../types/team';
import { KubernetesClientService } from '../../core/kubernetes-client.service';

@Injectable({
  providedIn: 'root',
})
export class TeamResolver implements Resolve<Team> {
  constructor(private kubernetesClientService: KubernetesClientService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Team> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const namespace = route.paramMap.get('organizationName')!;
    if (route.paramMap.get('name') === '$new') {
      return of({
        apiVersion: 'appuio.io/v1',
        kind: 'Team',
        metadata: {
          namespace,
          name: '',
        },
        spec: {
          displayName: '',
          userRefs: [],
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.kubernetesClientService.getTeam(namespace, route.paramMap.get('name')!);
  }
}
