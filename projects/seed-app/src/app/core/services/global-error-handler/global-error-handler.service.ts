import { ErrorHandler, Injectable } from '@angular/core';
import { ErrorNotificationService } from '../error-notification/error-notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {
  // private readonly zone = inject(NgZone);

  constructor(private errorNotification: ErrorNotificationService) { }

  handleError(error: any): void {
    const derivedError = error.rejection ? error.rejection : error;
    if (derivedError instanceof HttpErrorResponse) {
      this.errorNotification.addError(error);
      console.error('A HTTP error occurred:', error.message);
    } else {
      this.errorNotification.addError(error);
      console.error('An error occurred:', error.message);
    }
    // this.zone.run(() => this.router.navigate(['/error']));
  }
}
