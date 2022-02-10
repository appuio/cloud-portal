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
import { OrganizationMembersEditComponent } from './organization-members-edit/organization-members-edit.component';
import { FocusTrapModule } from 'primeng/focustrap';
import { MessageModule } from 'primeng/message';

@NgModule({
  declarations: [
    OrganizationsComponent,
    OrganizationEditComponent,
    OrganizationFormComponent,
    OrganizationMembersEditComponent,
  ],
  imports: [
    CommonModule,
    OrganizationsRoutingModule,
    StoreModule.forFeature(fromOrganization.organizationFeatureKey, fromOrganization.reducer),
    EffectsModule.forFeature([OrganizationEffects]),
    SharedModule,
    FocusTrapModule,
    MessageModule,
  ],
})
export class OrganizationsModule {
  constructor(store: Store) {
    store.dispatch(loadOrganizations());
  }
}
