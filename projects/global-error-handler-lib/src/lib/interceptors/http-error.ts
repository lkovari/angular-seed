import {
  type HttpInterceptorFn,
  type HttpErrorResponse,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorNotificationService } from '../services/error-notification';

const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: number;
  retryCondition?: (error: HttpErrorResponse) => boolean;
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(ErrorNotificationService);

  return next(req).pipe(
    // Retry logic commented out - errors show immediately for testing
    // To enable retry, uncomment the retryWithBackoff function below and use:
    // retryWithBackoff(DEFAULT_RETRY_CONFIG),

    // Global error handling
    catchError((error: HttpErrorResponse) => {
      handleHttpError(error, req, router, notificationService);
      return throwError(() => error);
    }),
  );
};

// Retry logic - commented out but kept for future use
// Uncomment and export if retry functionality is needed:
//
// export const DEFAULT_RETRY_CONFIG: RetryConfig = {
//   maxAttempts: 1,
//   delay: 500,
//   backoff: 2,
//   retryCondition: (error: HttpErrorResponse) => {
//     return error.status === 0;
//   },
// };
//
// export function retryWithBackoff(config: RetryConfig) {
//   return (source: Observable<unknown>): Observable<unknown> =>
//     source.pipe(
//       retry({
//         count: config.maxAttempts,
//         delay: (error: HttpErrorResponse, attempt: number) => {
//           if (!config.retryCondition?.(error)) {
//             return throwError(() => error);
//           }
//           const delayTime = config.delay * Math.pow(config.backoff, attempt - 1);
//           console.log(
//             `Retrying HTTP request in ${String(delayTime)}ms (attempt ${String(attempt)}/${String(config.maxAttempts)})`,
//           );
//           return timer(delayTime);
//         },
//       }),
//     );
// }

function handleHttpError(
  error: HttpErrorResponse,
  request: HttpRequest<unknown>,
  router: Router,
  notificationService: ErrorNotificationService,
): void {
  const correlationId = request.headers.get(CORRELATION_ID_HEADER);

  // Log the error details
  console.group('🌐 HTTP Error Interceptor');
  console.error('HTTP Error:', {
    status: error.status,
    url: error.url,
    message: error.message,
    error: error.error as unknown,
    correlationId: correlationId ?? 'Not set',
  });
  console.groupEnd();

  // Show notification for HTTP errors with call stack and status
  const message = getHttpErrorMessage(error);
  notificationService.addErrorWithCallStack(message, error, 'HttpError');

  // Handle specific HTTP errors
  switch (error.status) {
    case 401:
      handleUnauthorized();
      break;
    case 403:
      handleForbidden();
      break;
    case 404:
      handleNotFound(error);
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      handleServerError(error);
      break;
    case 0:
      handleNetworkError(error);
      break;
    default:
      handleGenericError(error);
  }
}

function getHttpErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Unable to connect to the server. Please check your internet connection.';
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in again.';
    case 402:
      return 'Payment required. Please complete payment to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return `An error occurred (${String(error.status)}). Please try again.`;
  }
}

function handleUnauthorized(): void {
  // Clear authentication tokens
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');

  // Redirect logic commented out - would use router if needed
  // const router = inject(Router);
  // router.navigate(['/login'], {
  //   queryParams: { returnUrl: router.url }
  // });
  console.warn('401 Unauthorized - would redirect to login if route exists');
}

function handleForbidden(): void {
  // Redirect logic commented out - would use router if needed
  // const router = inject(Router);
  // router.navigate(['/unauthorized']);
  console.warn(
    '403 Forbidden - would redirect to unauthorized page if route exists',
  );
}

function handleNotFound(error: HttpErrorResponse): void {
  console.warn(`Resource not found: ${error.url ?? 'unknown'}`);
  // TODO Could show a toast notification here
}

function handleServerError(error: HttpErrorResponse): void {
  console.error('Server error occurred:', error.status);
  // TODO Could show maintenance page or retry option
}

function handleNetworkError(error: HttpErrorResponse): void {
  console.error('Network error occurred:', error.message);
  // TODO Show offline message or retry option
}

function handleGenericError(error: HttpErrorResponse): void {
  console.error('Generic HTTP error:', error.status, error.message);
}
