import {
  type HttpInterceptorFn,
  type HttpErrorResponse,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { type Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ErrorNotificationService } from '../services/error-notification';

const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: number;
  retryCondition?: (error: HttpErrorResponse) => boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 1, // Reduced from 3 to 1 for faster error display
  delay: 500, // Reduced from 1000 to 500ms
  backoff: 2,
  retryCondition: (error: HttpErrorResponse) => {
    // Only retry on network errors (status 0), not on 5xx errors for testing
    return error.status === 0;
  },
};

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(ErrorNotificationService);

  return next(req).pipe(
    // No retry for testing - errors show immediately
    // retryWithBackoff(DEFAULT_RETRY_CONFIG),

    // Global error handling
    catchError((error: HttpErrorResponse) => {
      handleHttpError(error, req, router, notificationService);
      return throwError(() => error);
    }),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function retryWithBackoff(config: RetryConfig) {
  return (source: Observable<unknown>): Observable<unknown> =>
    source.pipe(
      retry({
        count: config.maxAttempts,
        delay: (error: HttpErrorResponse, attempt: number) => {
          if (!config.retryCondition?.(error)) {
            return throwError(() => error);
          }

          const delayTime =
            config.delay * Math.pow(config.backoff, attempt - 1);
          console.log(
            `Retrying HTTP request in ${delayTime}ms (attempt ${attempt}/${config.maxAttempts})`,
          );

          return timer(delayTime);
        },
      }),
    );
}

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
    statusText: error.statusText,
    url: error.url,
    message: error.message,
    error: error.error,
    correlationId: correlationId || 'Not set',
  });
  console.groupEnd();

  // Show notification for HTTP errors with call stack and status
  const message = getHttpErrorMessage(error);
  notificationService.addErrorWithCallStack(message, error, 'HttpError');

  // Handle specific HTTP errors
  switch (error.status) {
    case 401:
      handleUnauthorized(router);
      break;
    case 403:
      handleForbidden(router);
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
      return `An error occurred (${error.status}). Please try again.`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleUnauthorized(_router: Router): void {
  // Clear authentication tokens
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');

  // Only redirect if login route exists
  // router.navigate(['/login'], {
  //   queryParams: { returnUrl: router.url }
  // });
  console.warn('401 Unauthorized - would redirect to login if route exists');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleForbidden(_router: Router): void {
  // Only redirect if unauthorized route exists
  // router.navigate(['/unauthorized']);
  console.warn(
    '403 Forbidden - would redirect to unauthorized page if route exists',
  );
}

function handleNotFound(error: HttpErrorResponse): void {
  console.warn(`Resource not found: ${error.url}`);
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
