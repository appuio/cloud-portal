import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { KubernetesClientService } from '../core/kubernetes-client.service';
import { RoleBindingList } from '../types/role-bindings';

@Injectable({
  providedIn: 'root',
})
export class UsersRolesResolver implements Resolve<RoleBindingList | undefined> {
  constructor(private kubernetesClientService: KubernetesClientService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RoleBindingList | undefined> {
    const name = route.paramMap.get('name');
    if (name) {
      return this.kubernetesClientService.getRoleBindings(name);
    }
    return of(undefined);
  }
}
