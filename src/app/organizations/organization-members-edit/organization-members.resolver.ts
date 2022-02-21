import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { OrganizationMembers } from '../../types/organization-members';
import { KubernetesClientService } from '../../core/kubernetes-client.service';
import { Verb } from '../../store/app.reducer';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersResolver implements Resolve<OrganizationMembers | undefined> {
  constructor(private kubernetesClientService: KubernetesClientService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrganizationMembers | undefined> {
    const name = route.paramMap.get('name');
    if (name) {
      return this.kubernetesClientService.getOrganizationMembers(name).pipe(
        switchMap((members) =>
          this.kubernetesClientService.getOrganizationMembersPermission(name, Verb.Update).pipe(
            map((result) => {
              members.editMembers = result.includes(Verb.Update);
              return members;
            })
          )
        )
      );
    }
    return of(undefined);
  }
}
