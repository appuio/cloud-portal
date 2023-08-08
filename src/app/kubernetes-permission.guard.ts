import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { SelfSubjectAccessReviewCollectionService } from './store/ssar-collection.service';
import { SelfSubjectAccessReviewAttributes } from './types/self-subject-access-review';
import { DataServiceError } from '@ngrx/data';
import { MessageService } from 'primeng/api';

/**
 * This is a backed with @ngrx/data, intended to be replacing it over time.
 */
export const KubernetesPermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const permissions: SelfSubjectAccessReviewAttributes[] = route.data['requiredKubernetesPermissions'];
  if (!permissions || permissions?.length === 0) {
    return of(false).pipe(tap(() => console.log('no permissions defined to check for in KubernetesPermissionGuard')));
  }
  const permissionService: SelfSubjectAccessReviewCollectionService = inject(SelfSubjectAccessReviewCollectionService);
  const permissionList$ = permissions.map((attr) =>
    permissionService.isAllowed(attr.group, attr.resource, attr.verb, attr.namespace)
  );
  const router: Router = inject(Router);
  const messageService: MessageService = inject(MessageService);
  return forkJoin(permissionList$).pipe(
    map((perms: boolean[]) => {
      return perms.every((allowed) => allowed);
    }),
    tap((allAllowed) => {
      if (!allAllowed) {
        void router.navigate(['/home']);
      }
    }),
    catchError((err: DataServiceError) => {
      messageService.add({
        severity: 'error',
        summary: $localize`Could not determine access permissions`,
        detail: err.message ?? undefined,
      });
      void router.navigate(['/home']);
      return of(false);
    })
  );
};
