// Error Handling Core
export * from './global-error-handler';
export * from './interceptors/http-error';
export * from './services/error-notification';
export * from './providers/error-handling';

// Error Handling Types
export interface ErrorContext {
  feature: string;
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface MonitoringService {
  captureError(error: unknown, context?: ErrorContext): void;
  captureException(exception: Error, context?: ErrorContext): void;
  setUser(user: { id: string; email?: string; username?: string }): void;
  setTag(key: string, value: string): void;
  setContext(name: string, context: Record<string, unknown>): void;
}

// Utility functions
export function createErrorContext(
  feature: string,
  action: string,
  metadata?: Record<string, unknown>,
): ErrorContext {
  return {
    feature,
    action,
    userId: getCurrentUserId(), // Implement based on your auth system
    metadata,
  };
}

function getCurrentUserId(): string | undefined {
  // Implement based on your authentication system
  // For example: return this.authService.getCurrentUser()?.id;
  return undefined;
}
