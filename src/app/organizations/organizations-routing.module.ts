import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationEditComponent } from './organization-edit/organization-edit.component';

const routes: Routes = [
  { path: '', component: OrganizationsComponent },
  { path: ':name', component: OrganizationEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
