import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { ZonesComponent } from './zones.component';
import { KubernetesPermissionGuard } from '../kubernetes-permission.guard';
import { ZonePermissions } from '../types/zone';

const routes: Routes = [
  {
    path: '',
    component: ZonesComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...ZonePermissions, verb: 'list' }],
    },
  },
  {
    path: ':name',
    component: SingleZoneComponent,
    canActivate: [KubernetesPermissionGuard],
    data: {
      requiredKubernetesPermissions: [{ ...ZonePermissions, verb: 'list' }],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZonesRoutingModule {}
