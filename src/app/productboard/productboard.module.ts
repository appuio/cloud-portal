import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductboardComponent } from './productboard.component';
import { SharedModule } from 'primeng/api';
import { ProductboardRoutingModule } from './productboard-routing.module';

@NgModule({
  declarations: [ProductboardComponent],
  imports: [CommonModule, SharedModule, ProductboardRoutingModule],
})
export class ProductboardModule {}
