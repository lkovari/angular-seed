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

interface NotificationPayload {
  message: string;
  originalError: unknown;
  actualErrorType?: string;
}

function getStringProperty(obj: object, key: string): string | undefined {
  if (!Reflect.has(obj, key)) {
    return undefined;
  }
  const value: unknown = Reflect.get(obj, key);
  return typeof value === 'string' ? value : undefined;
}

function hasRejection(obj: object): obj is { rejection: unknown } {
  return 'rejection' in obj;
}

function hasNestedError(obj: object): obj is { error: unknown } {
  return 'error' in obj;
}

function getResourceUrl(el: HTMLElement): string {
  if (el instanceof HTMLScriptElement || el instanceof HTMLImageElement) {
    return el.src;
  }
  if (el instanceof HTMLLinkElement) {
    return el.href;
  }
  if (getStringProperty(el, 'src')) {
    return getStringProperty(el, 'src') ?? 'unknown';
  }
  if (getStringProperty(el, 'href')) {
    return getStringProperty(el, 'href') ?? 'unknown';
  }
  return 'unknown';
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    if ('message' in err && typeof err.message === 'string') {
      return err.message;
    }
    if ('reason' in err && typeof err.reason === 'string') {
      return err.reason;
    }
  }
  return String(err);
}

function getErrorStack(err: unknown): string | undefined {
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
}

function getConstructorName(value: object): string {
  if (
    'constructor' in value &&
    typeof value.constructor === 'object' &&
    'name' in value.constructor
  ) {
    const name: unknown = Reflect.get(value.constructor, 'name');
    return typeof name === 'string' ? name : 'Unknown';
  }
  return 'Unknown';
}

function formatReasonMessage(reason: unknown): {
  message: string;
  originalError: unknown;
} {
  if (reason instanceof Error) {
    return { message: reason.message, originalError: reason };
  }
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const msg = reason.message;
    const message =
      typeof msg === 'string' ? msg : JSON.stringify(reason, null, 2);
    return { message, originalError: reason };
  }
  if (typeof reason === 'string') {
    return { message: reason, originalError: reason };
  }
  if (reason !== null && reason !== undefined && typeof reason === 'object') {
    try {
      return {
        message: JSON.stringify(reason, null, 2),
        originalError: reason,
      };
    } catch {
      return { message: '[object Object]', originalError: reason };
    }
  }
  if (typeof reason === 'number' || typeof reason === 'boolean' || typeof reason === 'bigint') {
    return { message: reason.toString(), originalError: reason };
  }
  if (typeof reason === 'symbol') {
    return { message: reason.toString(), originalError: reason };
  }
  return { message: 'Promise Rejection', originalError: reason };
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
              ? String(reason.message)
              : 'Unhandled Promise Rejection',
          reason: event.reason,
          stack:
            reason && typeof reason === 'object' && 'stack' in reason
              ? String(reason.stack)
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
        if (event.target !== window && event.target instanceof HTMLElement) {
          const target = event.target;
          this.ngZone.run(() => {
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
                  ? String(eventError.stack)
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
      if (hasRejection(error)) {
        return error.rejection;
      }
      if (hasNestedError(error)) {
        return error.error;
      }
    }
    return error;
  }

  private logError(error: unknown, errorType = 'Unknown'): void {
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

    console.error(`Global Error Handler - ${errorType}`);
    console.error('Error Info:', errorInfo);
    console.error('Original Error:', error);
  }

  private notifyUser(error: unknown, errorType?: string): void {
    const payload = this.resolveNotificationPayload(error, errorType);
    this.showNotification(
      payload.message,
      'error',
      payload.originalError,
      payload.actualErrorType,
    );
  }

  private resolveNotificationPayload(
    error: unknown,
    errorType?: string,
  ): NotificationPayload {
    if (error instanceof HttpErrorResponse) {
      return {
        message: this.getHttpErrorMessage(error),
        originalError: error,
        actualErrorType: `HTTP ${String(error.status)} Error`,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message
          ? error.message
          : this.getFriendlyErrorMessage(error.message),
        originalError: error,
        actualErrorType: error.constructor.name || errorType,
      };
    }

    if (error && typeof error === 'object') {
      const objectPayload = this.resolveObjectNotificationPayload(
        error,
        errorType,
      );
      if (objectPayload) {
        return objectPayload;
      }
    }

    if (typeof error === 'string') {
      return {
        message: error,
        originalError: new Error(error),
        actualErrorType: errorType ?? 'String Error',
      };
    }

    return {
      message: 'An unexpected error occurred.',
      originalError: error,
      actualErrorType: errorType ?? 'Angular Error',
    };
  }

  private resolveObjectNotificationPayload(
    error: object,
    errorType?: string,
  ): NotificationPayload | undefined {
    const errMessage = getStringProperty(error, 'message');
    if (errMessage !== undefined) {
      return {
        message: errMessage
          ? errMessage
          : this.getFriendlyErrorMessage(errMessage),
        originalError: error,
        actualErrorType: errorType ?? 'JavaScript Error',
      };
    }

    if ('reason' in error) {
      const reason: unknown = Reflect.get(error, 'reason');
      return this.resolvePromiseRejectionPayload(reason);
    }

    const resourceType = getStringProperty(error, 'resourceType');
    if (resourceType) {
      const message = `Failed to load ${resourceType}. Please refresh the page.`;
      return {
        message,
        originalError: new Error(message),
        actualErrorType: 'Resource Loading Error',
      };
    }

    return undefined;
  }

  private resolvePromiseRejectionPayload(
    reason: unknown,
  ): NotificationPayload {
    const { message: reasonMessage, originalError } =
      formatReasonMessage(reason);
    return {
      message: reasonMessage
        ? reasonMessage
        : this.getFriendlyErrorMessage(reasonMessage),
      originalError,
      actualErrorType: 'Promise Rejection',
    };
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
    const httpContext = this.getHttpErrorContext(error);
    if (httpContext) {
      return httpContext;
    }

    const jsContext = this.getJavaScriptErrorContext(error);
    if (jsContext) {
      return jsContext;
    }

    const resourceContext = this.getResourceErrorContext(error);
    if (resourceContext) {
      return resourceContext;
    }

    const promiseContext = this.getPromiseRejectionContext(error);
    if (promiseContext) {
      return promiseContext;
    }

    const stackContext = this.getStackErrorContext(error);
    if (stackContext) {
      return stackContext;
    }

    return 'Global error context';
  }

  private getHttpErrorContext(error: unknown): string | undefined {
    if (error instanceof HttpErrorResponse) {
      return `HTTP Error - ${String(error.status)} ${error.url ?? 'unknown'}`;
    }
    return undefined;
  }

  private getJavaScriptErrorContext(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const filename = getStringProperty(error, 'filename');
    if (!filename) {
      return undefined;
    }

    const linenoValue: unknown = Reflect.has(error, 'lineno')
      ? Reflect.get(error, 'lineno')
      : undefined;
    const colnoValue: unknown = Reflect.has(error, 'colno')
      ? Reflect.get(error, 'colno')
      : undefined;
    const lineno = typeof linenoValue === 'number' ? String(linenoValue) : '?';
    const colno = typeof colnoValue === 'number' ? String(colnoValue) : '?';
    return `JavaScript Error - ${filename}:${lineno}:${colno}`;
  }

  private getResourceErrorContext(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const resourceType = getStringProperty(error, 'resourceType');
    if (!resourceType) {
      return undefined;
    }

    const resourceUrl = getStringProperty(error, 'resourceUrl') ?? 'unknown';
    return `Resource Loading Error - ${resourceType} at ${resourceUrl}`;
  }

  private getPromiseRejectionContext(error: unknown): string | undefined {
    if (!error || typeof error !== 'object' || !('reason' in error)) {
      return undefined;
    }

    const reason: unknown = Reflect.get(error, 'reason');
    if (reason && typeof reason === 'object') {
      const constructorName = getConstructorName(reason);
      return `Promise Rejection - ${constructorName}`;
    }
    return 'Promise Rejection - Unknown';
  }

  private getStackErrorContext(error: unknown): string | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'stack' in error &&
      typeof error.stack === 'string'
    ) {
      const stackLines = error.stack.split('\n');
      return stackLines[1]?.trim() ?? 'Unknown context';
    }
    return undefined;
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

    console.warn(`ERROR CAUGHT: ${message}`);
  }

  private reportError(error: unknown): void {
    const getErrorType = (err: unknown): string => {
      if (err && typeof err === 'object' && 'errorType' in err) {
        const errorTypeValue = err.errorType;
        return typeof errorTypeValue === 'string' ? errorTypeValue : 'Unknown';
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
      console.warn(
        'Error would be reported to monitoring service:',
        errorInfo,
      );
    }
  }

  private isProduction(): boolean {
    return false;
  }
}
