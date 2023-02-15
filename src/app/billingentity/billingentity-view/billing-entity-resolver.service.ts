import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BillingEntity } from '../../types/billing-entity';
import { EntityCollectionService, EntityCollectionServiceFactory } from '@ngrx/data';
import { billingEntityEntityKey } from '../../store/entity-metadata-map';

@Injectable({
  providedIn: 'root',
})
export class BillingEntityResolver implements Resolve<BillingEntity | undefined> {
  private billingService: EntityCollectionService<BillingEntity>;

  constructor(private entityFactory: EntityCollectionServiceFactory) {
    this.billingService = entityFactory.create<BillingEntity>(billingEntityEntityKey);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BillingEntity | undefined> {
    const name = route.paramMap.get('name');
    if (!name) {
      return of(undefined);
    }
    return this.billingService.getByKey(name);
  }
}
