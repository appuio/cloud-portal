import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  /**
   * Shows an error message as a toast, with 'Error' as the title.
   * This message is sticky and closable.
   * @param message
   */
  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: $localize`Error`,
      detail: message,
      closable: true,
      sticky: true,
    });
  }

  /**
   * Shows an error message with custom title as a toast.
   * This message is sticky and closable.
   * @param title
   * @param message
   */
  showErrorMessageWithTitle(title: string, message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      closable: true,
      sticky: true,
    });
  }

  /**
   * Shows a success message as toast.
   * Success messages are not sticky,
   * so there should be no actionable items or detailed info in the message.
   * When a success toast is used, the screen should also reflect the success of the user's action,
   * e.g. when editing a list item showing the updated list.
   * @param message
   */
  showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: $localize`Success`,
      detail: message,
      closable: true,
      sticky: false,
    });
  }

  /**
   * Shows an info message and title as toast.
   * The message is sticky and closable.
   * Use this sparingly, as most information should be shown in the UI instead of a toast.
   * @param title
   * @param message
   */
  showInfoMessage(title: string, message: string) {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      closable: true,
      sticky: true,
    });
  }
}
