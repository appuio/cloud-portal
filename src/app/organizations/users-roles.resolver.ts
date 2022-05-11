import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, map } from 'rxjs';
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
      return this.kubernetesClientService.getRoleBindings(name); //.pipe(map(this.mapToUserRoles));
    }
    return of(undefined);
  }

  private mapToUserRoles(roleBindings: RoleBindingList): Record<string, string[]> {
    const userRoles: Record<string, string[]> = {};
    roleBindings.items.forEach((item) => {
      item.subjects.forEach((subj) => {
        if (!userRoles[subj.name]) userRoles[subj.name] = [];
        userRoles[subj.name].push(item.roleRef.name);
      });
    });
    return userRoles;
  }
}
