import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { ReactiveComponentModule } from '@ngrx/component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [],
  imports: [],
  exports: [
    CommonModule,
    StyleClassModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    BadgeModule,
    TagModule,
    FontAwesomeModule,
    ClipboardModule,
    ToastModule,
    MessagesModule,
    ReactiveComponentModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService, DialogService],
})
export class SharedModule {}
