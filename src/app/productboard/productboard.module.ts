import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductboardComponent } from './productboard.component';
import { SharedModule } from 'primeng/api';
import { ProductboardRoutingModule } from './productboard-routing.module';

@NgModule({
    imports: [CommonModule, SharedModule, ProductboardRoutingModule, ProductboardComponent],
})
export default class ProductboardModule {}
