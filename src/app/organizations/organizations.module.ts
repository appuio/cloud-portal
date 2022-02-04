import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationsRoutingModule } from './organizations-routing.module';
import { OrganizationsComponent } from './organizations.component';
import { Store, StoreModule } from '@ngrx/store';
import * as fromOrganization from './store/organization.reducer';
import { EffectsModule } from '@ngrx/effects';
import { OrganizationEffects } from './store/organization.effects';
import { loadOrganizations } from './store/organization.actions';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';
import { SharedModule } from '../shared/shared.module';
import { OrganizationFormComponent } from './organization-form/organization-form.component';

@NgModule({
  declarations: [OrganizationsComponent, OrganizationEditComponent, OrganizationFormComponent],
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    StoreModule.forFeature(fromOrganization.organizationFeatureKey, fromOrganization.reducer),
    EffectsModule.forFeature([OrganizationEffects]),
    SharedModule,
  ],
})
export class OrganizationsModule {
  constructor(store: Store) {
    store.dispatch(loadOrganizations());
  }
}