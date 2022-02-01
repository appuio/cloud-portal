import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { Store, StoreModule } from '@ngrx/store';
import * as fromOrganization from './store/organization.reducer';
import { EffectsModule } from '@ngrx/effects';
import { OrganizationEffects } from './store/organization.effects';
import { loadOrganizations } from './store/organization.actions';
import { ReactiveComponentModule } from '@ngrx/component';
import { MessagesModule } from 'primeng/messages';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [OrganizationsComponent],
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    StoreModule.forFeature(fromOrganization.organizationFeatureKey, fromOrganization.reducer),
    EffectsModule.forFeature([OrganizationEffects]),
    ReactiveComponentModule,
    MessagesModule,
    FontAwesomeModule,
  ],
})
export class OrganizationsModule {
  constructor(store: Store) {
    store.dispatch(loadOrganizations());
  }
}
