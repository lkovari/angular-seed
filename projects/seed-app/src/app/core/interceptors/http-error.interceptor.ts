import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/internal/operators/catchError';
import { inject } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ErrorNotificationService } from '../services/error-notification/error-notification.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorNotification = inject(ErrorNotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse) {
        const stackTrace = new Error().stack || 'No stack trace available';
        const errorEntry = errorNotification.addError(error, true);
        errorEntry.stack = stackTrace;
        console.error('HTTP Interceptor caught an error:', error);
      }
      return throwError(() => error);
    }),
  );
};
