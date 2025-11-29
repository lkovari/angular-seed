import { ErrorHandler, Provider, EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Import our custom error handling services
import { GlobalErrorHandler } from '../global-error-handler';
import { httpErrorInterceptor } from '../interceptors/http-error';

export interface ErrorHandlingConfig {
  enableGlobalHandler: boolean;
  enableHttpInterceptor: boolean;
  enableNotifications: boolean;
  production: boolean;
  monitoringConfig?: {
    dsn?: string;
    environment?: string;
    release?: string;
  };
}

const DEFAULT_CONFIG: ErrorHandlingConfig = {
  enableGlobalHandler: true,
  enableHttpInterceptor: true,
  enableNotifications: true,
  production: false,
};

/**
 * Provides comprehensive error handling for Angular applications
 * This should be used in your app.config.ts
 */
export function provideErrorHandling(
  config: Partial<ErrorHandlingConfig> = {},
): Array<Provider | EnvironmentProviders> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const providers: Array<Provider | EnvironmentProviders> = [];

  // Global Error Handler
  if (finalConfig.enableGlobalHandler) {
    providers.push({
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    });
  }

  // HTTP Error Interceptor
  if (finalConfig.enableHttpInterceptor) {
    providers.push(provideHttpClient(withInterceptors([httpErrorInterceptor])));
  }

  // Error Notification Service (automatically provided via providedIn: 'root')
  // No explicit provider needed for ErrorNotificationService

  return providers;
}

/**
 * Simplified provider for basic error handling
 * Includes global error handler and HTTP interceptor with default settings
 */
export function provideBasicErrorHandling(): Array<
  Provider | EnvironmentProviders
> {
  return provideErrorHandling({
    enableGlobalHandler: true,
    enableHttpInterceptor: true,
    enableNotifications: true,
    production: false,
  });
}

/**
 * Production-ready error handling with monitoring integration
 */
export function provideProductionErrorHandling(
  monitoringConfig?: ErrorHandlingConfig['monitoringConfig'],
): Array<Provider | EnvironmentProviders> {
  return provideErrorHandling({
    enableGlobalHandler: true,
    enableHttpInterceptor: true,
    enableNotifications: true,
    production: true,
    monitoringConfig,
  });
}
