import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleZoneComponent } from './single-zone/single-zone.component';
import { ZonesComponent } from './zones.component';

const routes: Routes = [
  {
    path: '',
    component: ZonesComponent,
  },
  {
    path: ':name',
    component: SingleZoneComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ZonesRoutingModule {}
