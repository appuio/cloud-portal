import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';
import { Verb } from '../store/app.reducer';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityGuard implements CanActivate {
  constructor(private ssarService: SelfSubjectAccessReviewCollectionService, private router: Router) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.ssarService.isAllowed('billing.appuio.io', 'billingentities', Verb.List).pipe(
      tap((allowed) => {
        if (!allowed) {
          void this.router.navigate(['/home']);
        }
      })
    );
  }
}
