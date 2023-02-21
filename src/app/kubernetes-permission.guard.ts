import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { SelfSubjectAccessReviewAttributes } from './types/self-subject-access-review';
import { DataServiceError } from '@ngrx/data';
import { MessageService } from 'primeng/api';

/**
 * This is a newer version of {@link PermissionGuard} backed with @ngrx/data, intended to be replacing it over time.
 */
@Injectable({
  providedIn: 'root',
})
export class KubernetesPermissionGuard implements CanActivate {
  constructor(
    private permissionService: SelfSubjectAccessReviewCollectionService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const permissions: SelfSubjectAccessReviewAttributes[] = route.data['requiredKubernetesPermissions'];
    if (!permissions || permissions?.length === 0) {
      return of(false).pipe(tap(() => console.log('no permissions defined to check for in KubernetesPermissionGuard')));
    }
    const permissionList$ = permissions.map((attr) =>
      this.permissionService.isAllowed(attr.group, attr.resource, attr.verb, attr.namespace)
    );
    return forkJoin(permissionList$).pipe(
      map((perms: boolean[]) => {
        return perms.every((allowed) => allowed);
      }),
      tap((allAllowed) => {
        if (!allAllowed) {
          void this.router.navigate(['/home']);
        }
      }),
      catchError((err: DataServiceError) => {
        this.messageService.add({
          severity: 'error',
          summary: $localize`Could not determine access permissions`,
          detail: err.message ?? undefined,
        });
        void this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}
