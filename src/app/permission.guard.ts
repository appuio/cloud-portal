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
import { selectPermissions } from './store/app.selectors';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.store
      .select(selectPermissions)
      .pipe(take(1))
      .pipe(
        map((permissions) => {
          const { permission } = route.data;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return permissions[permission] ?? this.router.createUrlTree(['home']);
        })
      );
  }
}
