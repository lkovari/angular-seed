/*
 * Public API Surface of global-error-handler-lib
 */

export * from './lib/global-error-handler';
export * from './lib/interceptors/http-error';
export * from './lib/services/error-notification';
export * from './lib/providers/error-handling';
export * from './lib/generate-errors/generate-errors.component';

// Re-export key types for convenience
export type { ErrorNotification } from './lib/services/error-notification';
