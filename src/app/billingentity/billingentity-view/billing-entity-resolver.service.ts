import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BillingEntity } from '../../types/billing-entity';
import { billingEntityEntityKey } from '../../store/entity-metadata-map';
import {
  KubernetesCollectionService,
  KubernetesCollectionServiceFactory,
} from '../../store/kubernetes-collection.service';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityResolver implements Resolve<BillingEntity | undefined> {
  private billingService: KubernetesCollectionService<BillingEntity>;

  constructor(private entityFactory: KubernetesCollectionServiceFactory<BillingEntity>) {
    this.billingService = entityFactory.create(billingEntityEntityKey);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BillingEntity | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.billingService.getByKeyMemoized(name);
  }
}
