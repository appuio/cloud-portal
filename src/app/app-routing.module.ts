import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZonesComponent } from './zones/zones.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'zones',
    pathMatch: 'full',
  },
  {
    path: 'zones',
    component: ZonesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
