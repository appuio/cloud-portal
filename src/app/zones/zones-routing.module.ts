import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionGuard } from '../permission.guard';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { ZonesComponent } from './zones.component';

const routes: Routes = [
  {
    path: '',
    component: ZonesComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'zones',
      verb: 'list',
    },
  },
  {
    path: ':name',
    component: SingleZoneComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: 'zones',
      verb: 'list',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZonesRoutingModule {}
