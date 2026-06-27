import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  route?: string;
  httpStatus?: number;
  autoHide?: boolean;
  duration?: number;
  callStack?: string[];
  errorContext?: {
    url?: string;
    userAgent?: string;
    errorType?: string;
    originalError?: unknown;
  };
  action?: {
    label: string;
    handler: () => void;
  };
}

function getConstructorName(originalError: object): string {
  if (
    'constructor' in originalError &&
    typeof originalError.constructor === 'object' &&
    'name' in originalError.constructor
  ) {
    const name: unknown = Reflect.get(originalError.constructor, 'name');
    return typeof name === 'string' ? name : 'Unknown';
  }
  return 'Unknown';
}

function getHttpStatusFromError(originalError: object): number | undefined {
  if ('status' in originalError && typeof originalError.status === 'number') {
    return originalError.status;
  }
  if ('error' in originalError) {
    const nestedError = originalError.error;
    if (
      nestedError &&
      typeof nestedError === 'object' &&
      'status' in nestedError &&
      typeof nestedError.status === 'number'
    ) {
      return nestedError.status;
    }
  }
  return undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorNotificationService {
  private router = inject(Router);
  private notifications = signal<ErrorNotification[]>([]);
  errorHistory = signal<ErrorNotification[]>([]);
  private nextId = 1;
  private notificationTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  public readonly notificationsSignal = computed(() => this.notifications());

  public readonly errorHistorySignal = computed(() => this.errorHistory());

  addErrorWithCallStack(
    message: string,
    originalError?: unknown,
    errorType?: string,
    duration = 5000,
  ): string {
    const callStack = this.resolveCallStack(originalError);
    const errorContext = this.buildErrorContext(originalError, errorType);
    const httpStatus = this.resolveHttpStatus(originalError);
    const route = this.getCurrentRoute();

    console.warn(`ERROR WITH STACK: ${message}`, {
      callStack,
      errorContext,
      route,
      httpStatus,
    });

    return this.addNotification(
      {
        message,
        type: 'error',
        autoHide: true,
        duration,
        callStack,
        errorContext,
        route,
        httpStatus,
      },
      true,
    );
  }

  private resolveCallStack(originalError?: unknown): string[] {
    if (
      originalError &&
      typeof originalError === 'object' &&
      'stack' in originalError &&
      typeof originalError.stack === 'string'
    ) {
      return this.extractCallStack(originalError);
    }
    return this.extractCallStack(new Error());
  }

  private buildErrorContext(
    originalError: unknown,
    errorType?: string,
  ): ErrorNotification['errorContext'] {
    const resolvedErrorType =
      errorType ??
      (originalError && typeof originalError === 'object'
        ? getConstructorName(originalError)
        : 'Unknown');

    return {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      errorType: resolvedErrorType,
      originalError: originalError,
    };
  }

  private resolveHttpStatus(originalError?: unknown): number | undefined {
    if (originalError && typeof originalError === 'object') {
      return getHttpStatusFromError(originalError);
    }
    return undefined;
  }

  showError(message: string, duration = 5000): string {
    console.warn(`ERROR CAUGHT: ${message}`);

    const error = new Error(message);
    const callStack = this.extractCallStack(error);
    const route = this.getCurrentRoute();

    const config: Partial<ErrorNotification> = {
      message,
      type: 'error',
      autoHide: true,
      duration,
      ...(callStack.length > 0 && { callStack }),
      ...(route !== undefined && { route }),
    };
    const errorContext: ErrorNotification['errorContext'] = {
      errorType: 'ManualError',
    };
    if (typeof window !== 'undefined') {
      errorContext.url = window.location.href;
    }
    if (typeof navigator !== 'undefined') {
      errorContext.userAgent = navigator.userAgent;
    }
    if (errorContext.url || errorContext.userAgent) {
      config.errorContext = errorContext;
    }
    return this.addNotification(config, true);
  }

  showWarning(message: string, duration = 4000): string {
    return this.addNotification({
      message,
      type: 'warning',
      autoHide: true,
      duration,
    });
  }

  showInfo(message: string, duration = 3000): string {
    return this.addNotification({
      message,
      type: 'info',
      autoHide: true,
      duration,
    });
  }

  showSuccess(message: string, duration = 3000): string {
    return this.addNotification({
      message,
      type: 'success',
      autoHide: true,
      duration,
    });
  }

  showPersistent(
    message: string,
    type: ErrorNotification['type'] = 'error',
    action?: ErrorNotification['action'],
  ): string {
    const config: Partial<ErrorNotification> = {
      message,
      type,
      autoHide: false,
    };
    if (action !== undefined) {
      config.action = action;
    }
    return this.addNotification(config);
  }

  dismiss(id: string): void {
    const timeoutId = this.notificationTimeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.notificationTimeouts.delete(id);
    }

    const current = this.notifications();
    this.notifications.set(
      current.filter((n: ErrorNotification) => n.id !== id),
    );
  }

  dismissAll(): void {
    this.notifications.set([]);
  }

  getAllErrors(): ErrorNotification[] {
    return this.errorHistory();
  }

  clearErrorHistory(): void {
    this.errorHistory.set([]);
  }

  clearHistory(): void {
    this.clearErrorHistory();
  }

  private getCurrentRoute(): string | undefined {
    try {
      return this.router.url || undefined;
    } catch {
      return undefined;
    }
  }

  private extractCallStack(error?: unknown): string[] {
    if (!error) {
      const stack = new Error().stack;
      return stack ? this.parseStackTrace(stack, true) : ['Stack trace not available'];
    }

    if (
      typeof error === 'object' &&
      'stack' in error &&
      typeof error.stack === 'string'
    ) {
      return this.parseStackTrace(error.stack, false);
    }

    if (typeof error === 'string') {
      return [error];
    }

    const stack = new Error().stack;
    return stack ? this.parseStackTrace(stack, true) : ['Stack trace not available'];
  }

  private parseStackTrace(stackTrace?: string, isGenerated = false): string[] {
    if (!stackTrace) {
      return ['Stack trace not available'];
    }

    const lines = stackTrace
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.trim());

    const atLines = lines.filter((line) => line.includes('at '));

    if (atLines.length > 0) {
      let filtered = atLines.filter(
        (line) =>
          !line.includes('Zone.run') &&
          !line.includes('ZoneDelegate') &&
          !line.includes('zone.js'),
      );

      if (isGenerated) {
        filtered = filtered.filter(
          (line) =>
            !line.includes('ErrorNotificationService') &&
            !line.includes('extractCallStack') &&
            !line.includes('addErrorWithCallStack') &&
            !line.includes('showError'),
        );
      }

      const cleaned = filtered.map((line) => {
        if (line.includes('localhost:4200')) {
          const regex = /localhost:4200\/(.+?)(?:\?|$)/;
          const match = regex.exec(line);
          if (match) {
            return line.replace(match[0], match[1] ?? '');
          }
        }
        return line;
      });

      const result = cleaned.slice(0, 15);
      return result.length > 0 ? result : ['at (call location not available)'];
    }

    const result = lines.slice(0, 15);
    return result.length > 0 ? result : ['Stack trace format not recognized'];
  }

  private addNotification(
    config: Partial<ErrorNotification>,
    addToHistory = false,
  ): string {
    const notification: ErrorNotification = {
      id: `error-${String(this.nextId++)}`,
      message: config.message ?? '',
      type: config.type ?? 'error',
      timestamp: new Date(),
      ...(config.route !== undefined && { route: config.route }),
      ...(config.httpStatus !== undefined && { httpStatus: config.httpStatus }),
      autoHide: config.autoHide ?? true,
      duration: config.duration ?? 5000,
      ...(config.callStack !== undefined && { callStack: config.callStack }),
      ...(config.errorContext !== undefined && {
        errorContext: config.errorContext,
      }),
      ...(config.action !== undefined && { action: config.action }),
    };

    const current = this.notifications();
    this.notifications.set([...current, notification]);

    if (addToHistory) {
      const currentHistory = this.errorHistory();
      this.errorHistory.set([...currentHistory, notification]);
    }

    if (notification.autoHide && notification.duration) {
      const timeoutId = setTimeout(() => {
        this.dismiss(notification.id);
        this.notificationTimeouts.delete(notification.id);
      }, notification.duration);
      this.notificationTimeouts.set(notification.id, timeoutId);
    }

    return notification.id;
  }
}
