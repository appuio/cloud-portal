import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { SelfSubjectAccessReviewCollectionService } from '../../store/ssar-collection.service';
import { Observable, of } from 'rxjs';
import { SelfSubjectAccessReview } from '../../types/self-subject-access-review';
import { Verb } from '../../store/app.reducer';

@Injectable({
  providedIn: 'root',
})
export class OrganizationMembersEditResolver implements Resolve<SelfSubjectAccessReview | undefined> {
  constructor(private ssarCollectionService: SelfSubjectAccessReviewCollectionService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SelfSubjectAccessReview | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.ssarCollectionService.getBySelfSubjectAccessReview(
      new SelfSubjectAccessReview(Verb.Update, 'organizationmembers', 'appuio.io', name)
    );
  }
}
