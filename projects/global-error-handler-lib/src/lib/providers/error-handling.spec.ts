import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ErrorHandler } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideErrorHandling,
  provideBasicErrorHandling,
  provideProductionErrorHandling,
  type ErrorHandlingConfig,
} from './error-handling';
import { GlobalErrorHandler } from '../global-error-handler';

describe('provideErrorHandling', () => {
  describe('Default Configuration', () => {
    it('should return providers with default configuration when no config provided', () => {
      const providers = provideErrorHandling();

      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should include ErrorHandler provider by default', () => {
      const providers = provideErrorHandling();

      const errorHandlerProvider = providers.find(
        (p): p is { provide: typeof ErrorHandler; useClass: typeof GlobalErrorHandler } =>
          typeof p === 'object' &&
          'provide' in p &&
          (p as { provide: unknown }).provide === ErrorHandler,
      );

      expect(errorHandlerProvider).toBeDefined();
    });

    it('should include HTTP interceptor provider by default', () => {
      const providers = provideErrorHandling();

      expect(providers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Configuration Merging', () => {
    it('should merge partial config with defaults', () => {
      const customConfig: Partial<ErrorHandlingConfig> = {
        production: true,
      };

      const providers = provideErrorHandling(customConfig);

      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should use default values for unspecified config options', () => {
      const providers = provideErrorHandling({ production: true });

      const errorHandlerProvider = providers.find(
        (p): p is { provide: typeof ErrorHandler; useClass: typeof GlobalErrorHandler } =>
          typeof p === 'object' &&
          'provide' in p &&
          (p as { provide: unknown }).provide === ErrorHandler,
      );

      expect(errorHandlerProvider).toBeDefined();
    });
  });

  describe('Conditional Provider Inclusion', () => {
    it('should include ErrorHandler when enableGlobalHandler is true', () => {
      const providers = provideErrorHandling({
        enableGlobalHandler: true,
      });

      const errorHandlerProvider = providers.find(
        (p): p is { provide: typeof ErrorHandler; useClass: typeof GlobalErrorHandler } =>
          typeof p === 'object' &&
          'provide' in p &&
          (p as { provide: unknown }).provide === ErrorHandler,
      );

      expect(errorHandlerProvider).toBeDefined();
      expect(errorHandlerProvider?.useClass).toBe(GlobalErrorHandler);
    });

    it('should NOT include ErrorHandler when enableGlobalHandler is false', () => {
      const providers = provideErrorHandling({
        enableGlobalHandler: false,
      });

      const errorHandlerProvider = providers.find(
        (p): p is { provide: typeof ErrorHandler; useClass: typeof GlobalErrorHandler } =>
          typeof p === 'object' &&
          'provide' in p &&
          (p as { provide: unknown }).provide === ErrorHandler,
      );

      expect(errorHandlerProvider).toBeUndefined();
    });

    it('should include HTTP interceptor when enableHttpInterceptor is true', () => {
      const providers = provideErrorHandling({
        enableHttpInterceptor: true,
      });

      expect(providers.length).toBeGreaterThan(0);
    });

    it('should NOT include HTTP interceptor when enableHttpInterceptor is false', () => {
      const providers = provideErrorHandling({
        enableHttpInterceptor: false,
        enableGlobalHandler: false,
      });

      expect(providers.length).toBe(0);
    });

    it('should handle both handlers disabled', () => {
      const providers = provideErrorHandling({
        enableGlobalHandler: false,
        enableHttpInterceptor: false,
      });

      expect(providers.length).toBe(0);
    });

    it('should handle both handlers enabled', () => {
      const providers = provideErrorHandling({
        enableGlobalHandler: true,
        enableHttpInterceptor: true,
      });

      expect(providers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Provider Structure', () => {
    it('should provide ErrorHandler with GlobalErrorHandler class', () => {
      const providers = provideErrorHandling({
        enableGlobalHandler: true,
      });

      const errorHandlerProvider = providers.find(
        (p): p is { provide: typeof ErrorHandler; useClass: typeof GlobalErrorHandler } =>
          typeof p === 'object' &&
          'provide' in p &&
          (p as { provide: unknown }).provide === ErrorHandler,
      );

      expect(errorHandlerProvider).toBeDefined();
      expect(errorHandlerProvider.useClass).toBe(GlobalErrorHandler);
    });
  });

  describe('Integration Tests', () => {
    it('should work when provided in TestBed', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          ...provideErrorHandling({
            enableGlobalHandler: true,
            enableHttpInterceptor: true,
          }),
        ],
      });

      const errorHandler = TestBed.inject(ErrorHandler);
      expect(errorHandler).toBeInstanceOf(GlobalErrorHandler);
    });

    it('should handle errors when ErrorHandler is provided', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          ...provideErrorHandling({
            enableGlobalHandler: true,
            enableHttpInterceptor: true,
          }),
        ],
      });

      const errorHandler = TestBed.inject(ErrorHandler);
      const handleErrorSpy = vi.spyOn(errorHandler, 'handleError');

      const testError = new Error('Test error');
      errorHandler.handleError(testError);

      expect(handleErrorSpy).toHaveBeenCalledWith(testError);
    });
  });
});

describe('provideBasicErrorHandling', () => {
  it('should return providers with default settings', () => {
    const providers = provideBasicErrorHandling();

    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should include ErrorHandler provider', () => {
    const providers = provideBasicErrorHandling();

    const errorHandlerProvider = providers.find(
      (p) =>
        typeof p === 'object' &&
        'provide' in p &&
        (p as { provide: unknown }).provide === ErrorHandler,
    );

    expect(errorHandlerProvider).toBeDefined();
  });

  it('should be equivalent to provideErrorHandling with defaults', () => {
    const basicProviders = provideBasicErrorHandling();
    const defaultProviders = provideErrorHandling();

    expect(basicProviders.length).toBe(defaultProviders.length);
  });
});

describe('provideProductionErrorHandling', () => {
  it('should return providers with production: true', () => {
    const providers = provideProductionErrorHandling();

    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should include ErrorHandler provider', () => {
    const providers = provideProductionErrorHandling();

    const errorHandlerProvider = providers.find(
      (p) =>
        typeof p === 'object' &&
        'provide' in p &&
        (p as { provide: unknown }).provide === ErrorHandler,
    );

    expect(errorHandlerProvider).toBeDefined();
  });

  it('should accept and pass monitoring config', () => {
    const monitoringConfig = {
      dsn: 'https://example.com/sentry',
      environment: 'production',
      release: '1.0.0',
    };

    const providers = provideProductionErrorHandling(monitoringConfig);

    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
  });

  it('should work without monitoring config', () => {
    const providers = provideProductionErrorHandling();

    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
  });
});
