import { Injectable } from '@angular/core';
import { JoinDialogComponent } from './join-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class JoinDialogService {
  constructor(private dialogService: DialogService) {}

  showDialog(): void {
    this.dialogService.open(JoinDialogComponent, {
      modal: true,
      closable: true,
      header: $localize`Join Organization or Billing address`,
    });
  }
}
