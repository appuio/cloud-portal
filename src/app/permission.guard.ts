import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectPermission } from './store/app.selectors';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.store
      .select(selectPermission)
      .pipe(take(1))
      .pipe(
        map((permission) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const hasPermission = permission[route.data.permission];
          if (!hasPermission) {
            return this.router.navigate(['/home']);
          }
          return hasPermission;
        })
      );
  }
}
