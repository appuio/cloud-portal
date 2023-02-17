import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SelfSubjectAccessReviewCollectionService } from '../store/ssar-collection.service';
import { Verb } from '../store/app.reducer';
import { map, Observable, tap } from 'rxjs';
import { SelfSubjectAccessReview } from '../types/self-subject-access-review';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityGuard implements CanActivate {
  constructor(private ssarService: SelfSubjectAccessReviewCollectionService, private router: Router) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.ssarService
      .getBySelfSubjectAccessReviewLazy(
        new SelfSubjectAccessReview(Verb.List, 'billingentities', 'billing.appuio.io', '')
      )
      .pipe(
        map((ssar) => ssar.status.allowed),
        tap((allowed) => {
          if (!allowed) {
            void this.router.navigate(['/home']);
          }
        })
      );
  }
}