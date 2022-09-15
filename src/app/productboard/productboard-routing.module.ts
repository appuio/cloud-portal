import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductboardComponent } from './productboard.component';

const routes: Routes = [{ path: '', component: ProductboardComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductboardRoutingModule {}
