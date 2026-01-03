import { type ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from './services/error-notification';

export interface ErrorInfo {
  error: unknown;
  timestamp: Date;
  url?: string;
  userId?: string;
  userAgent: string;
  stack?: string;
  context?: string;
  errorType?: string;
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly ngZone = inject(NgZone);
  private readonly notificationService = inject(ErrorNotificationService);
  private hasInitialized = false;

  constructor() {
    this.initializeErrorListeners();
  }

  private initializeErrorListeners(): void {
    if (this.hasInitialized || typeof window === 'undefined') {
      return;
    }
    this.hasInitialized = true;

    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();

      this.ngZone.run(() => {
        const reason: unknown = event.reason;
        const error: {
          message: string;
          reason: unknown;
          stack?: string;
          promise: Promise<unknown>;
        } = {
          message:
            reason && typeof reason === 'object' && 'message' in reason
              ? String((reason as { message: unknown }).message)
              : 'Unhandled Promise Rejection',
          reason: event.reason,
          stack:
            reason && typeof reason === 'object' && 'stack' in reason
              ? String((reason as { stack: unknown }).stack)
              : undefined,
          promise: event.promise,
        };
        this.logError(error, 'Promise Rejection');
        this.notifyUser(error, 'Promise Rejection');
      });
    });

    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          this.ngZone.run(() => {
            const target = event.target as HTMLElement;
            const getResourceUrl = (el: HTMLElement): string => {
              if (
                'src' in el &&
                typeof (el as { src: unknown }).src === 'string'
              ) {
                return (el as { src: string }).src;
              }
              if (
                'href' in el &&
                typeof (el as { href: unknown }).href === 'string'
              ) {
                return (el as { href: string }).href;
              }
              return 'unknown';
            };
            const error = {
              message: 'Resource Loading Error',
              resourceType: target.tagName.toLowerCase() || 'unknown',
              resourceUrl: getResourceUrl(target),
              outerHTML: target.outerHTML.substring(0, 200) || 'unknown',
            };
            this.logError(error, 'Resource Loading Error');
            this.notifyUser(error, 'Resource Loading Error');
          });
        } else {
          event.preventDefault();

          this.ngZone.run(() => {
            const eventError: unknown = event.error;
            const error: {
              message: string;
              filename?: string;
              lineno?: number;
              colno?: number;
              stack?: string;
              error: unknown;
            } = {
              message: event.message || 'JavaScript Error',
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              stack:
                eventError &&
                typeof eventError === 'object' &&
                'stack' in eventError
                  ? String((eventError as { stack: unknown }).stack)
                  : undefined,
              error: event.error,
            };
            this.logError(error, 'Timeout Error');
            this.notifyUser(error, 'Timeout Error');
          });
        }
      },
      true,
    );
  }

  handleError(error: unknown): void {
    this.ngZone.runOutsideAngular(() => {
      const actualError = this.extractActualError(error);

      this.logError(actualError, 'Angular Error');
      this.notifyUser(actualError, 'Angular Error');
      this.reportError(actualError);
    });
  }

  private extractActualError(error: unknown): unknown {
    if (error && typeof error === 'object') {
      if ('rejection' in error) {
        return (error as { rejection: unknown }).rejection;
      }
      if ('error' in error) {
        return (error as { error: unknown }).error;
      }
    }
    return error;
  }

  private logError(error: unknown, errorType = 'Unknown'): void {
    const getErrorMessage = (err: unknown): string => {
      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          return err.message;
        }
        if ('reason' in err && typeof err.reason === 'string') {
          return err.reason;
        }
      }
      return String(err);
    };

    const getErrorStack = (err: unknown): string | undefined => {
      if (err && typeof err === 'object') {
        if ('stack' in err && typeof err.stack === 'string') {
          return err.stack;
        }
        if (
          'reason' in err &&
          err.reason &&
          typeof err.reason === 'object' &&
          'stack' in err.reason &&
          typeof err.reason.stack === 'string'
        ) {
          return (err.reason as { stack: string }).stack;
        }
      }
      return undefined;
    };

    const stack = getErrorStack(error);
    const context = this.getErrorContext(error);
    const errorInfo: ErrorInfo = {
      error: getErrorMessage(error),
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    if (stack !== undefined) {
      errorInfo.stack = stack;
    }
    if (context) {
      errorInfo.context = context;
    }
    if (errorType) {
      errorInfo.errorType = errorType;
    }

    console.group(`Global Error Handler - ${errorType}`);
    console.error('Error Info:', errorInfo);
    console.error('Original Error:', error);
    console.groupEnd();
  }

  private notifyUser(error: unknown, errorType?: string): void {
    let message = 'An unexpected error occurred.';
    let originalError = error;
    let actualErrorType = errorType;

    if (error instanceof HttpErrorResponse) {
      message = this.getHttpErrorMessage(error);
      originalError = error;
      actualErrorType = `HTTP ${String(error.status)} Error`;
    } else if (error instanceof Error) {
      // Standard Error object - use the actual error message
      message = error.message || this.getFriendlyErrorMessage(error.message);
      originalError = error;
      actualErrorType = error.constructor.name || errorType;
    } else if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      const errMessage = (error as { message: string }).message;
      message = errMessage || this.getFriendlyErrorMessage(errMessage);
      originalError = error;
      actualErrorType = errorType ?? 'JavaScript Error';
      } else if (
        error &&
        typeof error === 'object' &&
        'reason' in error
      ) {
        const reason = (error as { reason: unknown }).reason;
      let reasonMessage = 'Promise Rejection';
      if (reason instanceof Error) {
        reasonMessage = reason.message;
        originalError = reason;
      } else if (reason && typeof reason === 'object' && 'message' in reason) {
        const msg = (reason as { message: unknown }).message;
        reasonMessage =
          typeof msg === 'string'
            ? msg
            : JSON.stringify(reason, null, 2);
        originalError = reason;
      } else if (reason !== null && reason !== undefined) {
        if (typeof reason === 'string') {
          reasonMessage = reason;
        } else if (typeof reason === 'object') {
          try {
            reasonMessage = JSON.stringify(reason, null, 2);
          } catch {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            reasonMessage = typeof reason === 'object' && reason !== null ? '[object Object]' : String(reason);
          }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (reason !== null && reason !== undefined) {
          if (typeof reason === 'string') {
            reasonMessage = reason;
          } else if (typeof reason === 'object') {
            try {
              reasonMessage = JSON.stringify(reason);
            } catch {
              reasonMessage = '[object Object]';
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            reasonMessage = String(reason);
          }
        }
        originalError = reason;
      }
      message = reasonMessage || this.getFriendlyErrorMessage(reasonMessage);
      actualErrorType = 'Promise Rejection';
    } else if (
      error &&
      typeof error === 'object' &&
      'resourceType' in error &&
      typeof (error as { resourceType: unknown }).resourceType === 'string'
    ) {
      const resourceType = (error as { resourceType: string }).resourceType;
      message = `Failed to load ${resourceType}. Please refresh the page.`;
      originalError = new Error(message);
      actualErrorType = 'Resource Loading Error';
    } else if (typeof error === 'string') {
      message = error;
      originalError = new Error(error);
      actualErrorType = errorType ?? 'String Error';
    }

    this.showNotification(message, 'error', originalError, actualErrorType);
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized. Please log in again.';
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

  private getFriendlyErrorMessage(message: string): string {
    const errorMappings: Record<string, string> = {
      ChunkLoadError:
        'Failed to load application resources. Please refresh the page.',
      'Script error': 'A script error occurred. Please refresh the page.',
      'Network Error':
        'Network connection failed. Please check your internet connection.',
      TypeError: 'A technical error occurred. Please try again.',
      ReferenceError: 'A reference error occurred. Please refresh the page.',
      SyntaxError: 'A syntax error occurred. Please refresh the page.',
      RangeError: 'A range error occurred. Please try again.',
      EvalError: 'An evaluation error occurred. Please try again.',
      URIError: 'A URI error occurred. Please check the URL.',
      Promise: 'An asynchronous operation failed. Please try again.',
      fetch: 'Network request failed. Please check your connection.',
      XMLHttpRequest: 'Request failed. Please try again.',
      WebSocket: 'WebSocket connection failed. Please try again.',
      Import: 'Failed to load module. Please refresh the page.',
      Export: 'Failed to export module. Please refresh the page.',
    };

    const messageStr = message.toLowerCase();

    for (const [technical, friendly] of Object.entries(errorMappings)) {
      if (messageStr.includes(technical.toLowerCase())) {
        return friendly;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private getErrorContext(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return `HTTP Error - ${String(error.status)} ${error.url ?? 'unknown'}`;
    }

    if (
      error &&
      typeof error === 'object' &&
      'filename' in error &&
      typeof (error as { filename: unknown }).filename === 'string'
    ) {
      const err = error as {
        filename: string;
        lineno?: number;
        colno?: number;
      };
      return `JavaScript Error - ${err.filename}:${String(err.lineno ?? '?')}:${String(err.colno ?? '?')}`;
    }

    if (
      error &&
      typeof error === 'object' &&
      'resourceType' in error &&
      typeof (error as { resourceType: unknown }).resourceType === 'string'
    ) {
      const err = error as {
        resourceType: string;
        resourceUrl?: string;
      };
      return `Resource Loading Error - ${err.resourceType} at ${err.resourceUrl ?? 'unknown'}`;
    }

    if (
      error &&
      typeof error === 'object' &&
      'reason' in error
    ) {
      const reason = (error as { reason: unknown }).reason;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (reason && typeof reason === 'object' && reason !== null && 'constructor' in reason) {
        const constructor = reason.constructor;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (typeof constructor === 'object' && constructor !== null && 'name' in constructor) {
          const name = (constructor as { name: unknown }).name;
          return `Promise Rejection - ${typeof name === 'string' ? name : 'Unknown'}`;
        }
      }
      return 'Promise Rejection - Unknown';
    }

    if (
      error &&
      typeof error === 'object' &&
      'stack' in error &&
      typeof (error as { stack: unknown }).stack === 'string'
    ) {
      const stack = (error as { stack: string }).stack;
      const stackLines = stack.split('\n');
      return stackLines[1]?.trim() ?? 'Unknown context';
    }

    return 'Global error context';
  }

  private showNotification(
    message: string,
    type: 'error' | 'warning' | 'info',
    originalError?: unknown,
    errorType?: string,
  ): void {
    this.ngZone.run(() => {
      switch (type) {
        case 'error':
          if (originalError) {
            this.notificationService.addErrorWithCallStack(
              message,
              originalError,
              errorType,
            );
          } else {
            this.notificationService.showError(message);
          }
          break;
        case 'warning':
          this.notificationService.showWarning(message);
          break;
        case 'info':
          this.notificationService.showInfo(message);
          break;
      }
    });

    console.log(`ERROR CAUGHT: ${message}`);
  }

  private reportError(error: unknown): void {
    const getErrorMessage = (err: unknown): string => {
      if (err && typeof err === 'object') {
        if ('message' in err && typeof err.message === 'string') {
          return err.message;
        }
        if ('reason' in err && typeof err.reason === 'string') {
          return err.reason;
        }
      }
      return String(err);
    };

    const getErrorStack = (err: unknown): string | undefined => {
      if (err && typeof err === 'object') {
        if ('stack' in err && typeof err.stack === 'string') {
          return err.stack;
        }
        if (
          'reason' in err &&
          err.reason &&
          typeof err.reason === 'object' &&
          'stack' in err.reason &&
          typeof err.reason.stack === 'string'
        ) {
          return err.reason.stack;
        }
      }
      return undefined;
    };

    const getErrorType = (err: unknown): string => {
      if (err && typeof err === 'object' && 'errorType' in err) {
        const errorType = (err as { errorType: unknown }).errorType;
        return typeof errorType === 'string' ? errorType : 'Unknown';
      }
      return 'Unknown';
    };

    const stack = getErrorStack(error);
    const context = this.getErrorContext(error);
    const errorTypeValue = getErrorType(error);
    const errorInfo: ErrorInfo = {
      error: getErrorMessage(error),
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    if (stack !== undefined) {
      errorInfo.stack = stack;
    }
    if (context) {
      errorInfo.context = context;
    }
    if (errorTypeValue) {
      errorInfo.errorType = errorTypeValue;
    }

    if (!this.isProduction()) {
      console.log('Error would be reported to monitoring service:', errorInfo);
    }
  }

  private isProduction(): boolean {
    return false;
  }
}
