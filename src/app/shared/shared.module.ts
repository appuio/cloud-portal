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
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { FocusTrapModule } from 'primeng/focustrap';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    DialogModule,
    CheckboxModule,
    DropdownModule,
    FocusTrapModule,
    MessageModule,
    ConfirmDialogModule,
    MultiSelectModule,
    ProgressSpinnerModule,
  ],
})
export class SharedModule {}
