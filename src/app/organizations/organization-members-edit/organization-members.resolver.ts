import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrganizationMembers } from '../../types/organization-members';
import { KubernetesClientService } from '../../core/kubernetes-client.service';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersResolver implements Resolve<OrganizationMembers | undefined> {
  constructor(private kubernetesClientService: KubernetesClientService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrganizationMembers | undefined> {
    const name = route.paramMap.get('name');
    if (name) {
      return this.kubernetesClientService.getOrganizationMembers(name);
    }
    return of(undefined);
  }
}
