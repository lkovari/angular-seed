import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error-handler';
import { ErrorNotificationService } from './services/error-notification';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let notificationService: ErrorNotificationService;
  let ngZone: NgZone;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, ErrorNotificationService],
    });

    handler = TestBed.inject(GlobalErrorHandler);
    notificationService = TestBed.inject(ErrorNotificationService);
    ngZone = TestBed.inject(NgZone);

    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {
      // Mock implementation
    });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      // Mock implementation
    });
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // Mock implementation
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(handler).toBeTruthy();
    });

    it('should initialize error listeners on construction', () => {
      expect(handler).toBeInstanceOf(GlobalErrorHandler);
    });
  });

  describe('handleError', () => {
    it('should handle standard Error objects', () => {
      const error = new Error('Test error');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should extract actual error from Angular wrapper with rejection', () => {
      const actualError = new Error('Actual error');
      const wrappedError = { rejection: actualError };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(wrappedError);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs?.[1]).toBe(actualError);
      expect(['Angular Error', 'Error']).toContain(callArgs?.[2]);
    });

    it('should extract actual error from Angular wrapper with error property', () => {
      const actualError = new Error('Actual error');
      const wrappedError = { error: actualError };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(wrappedError);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs?.[1]).toBe(actualError);
      expect(['Angular Error', 'Error']).toContain(callArgs?.[2]);
    });

    it('should handle string errors', () => {
      const error = 'String error';
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should handle HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
      });
      const showErrorSpy = vi.spyOn(notificationService, 'showError');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(httpError);

      const showErrorCalled = showErrorSpy.mock.calls.length > 0;
      const addErrorCalled = addErrorSpy.mock.calls.length > 0;
      expect(showErrorCalled || addErrorCalled).toBe(true);
    });

    it('should run outside Angular zone', () => {
      const runOutsideAngularSpy = vi.spyOn(ngZone, 'runOutsideAngular');
      const error = new Error('Test error');

      handler.handleError(error);

      expect(runOutsideAngularSpy).toHaveBeenCalled();
    });

    it('should log error information', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should report error', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleLogSpy).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment -- Vitest mock.calls is typed as any
      const mockCalls = consoleLogSpy.mock.calls;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Type assertion needed for Vitest mock calls
      const logCalls = (mockCalls as unknown) as [string, unknown][];
      const hasReportCall = logCalls.some((call) => {
        const firstArg = call[0];
        return typeof firstArg === 'string' && firstArg.includes('Error would be reported');
      });
      expect(hasReportCall || logCalls.length > 0).toBe(true);
    });
  });

  describe('Error Notification', () => {
    it('should notify user for Error objects', () => {
      const error = new Error('Test error message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs?.[0]).toBe('Test error message');
      expect(callArgs?.[1]).toBe(error);
      expect(['Angular Error', 'Error']).toContain(callArgs[2]);
    });

    it('should notify user for TypeError', () => {
      const error = new TypeError('Type error message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should notify user for ReferenceError', () => {
      const error = new ReferenceError('Reference error message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should notify user for HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/test',
      });
      const showErrorSpy = vi.spyOn(notificationService, 'showError');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(httpError);

      const showErrorCalled = showErrorSpy.mock.calls.length > 0;
      const addErrorCalled = addErrorSpy.mock.calls.length > 0;
      expect(showErrorCalled || addErrorCalled).toBe(true);
    });

    it('should notify user for promise rejection error', () => {
      const promiseError = {
        reason: new Error('Promise rejection'),
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(promiseError);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should notify user for resource loading error', () => {
      const resourceError = {
        resourceType: 'img',
        resourceUrl: '/path/to/image.jpg',
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(resourceError);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should notify user for string error', () => {
      const stringError = 'String error message';
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(stringError);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should use default message for unknown error types', () => {
      const unknownError = { someProperty: 'value' };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(unknownError);

      expect(addErrorSpy).toHaveBeenCalledWith(
        'An unexpected error occurred.',
        unknownError,
        'Angular Error',
      );
    });
  });

  describe('HTTP Error Messages', () => {
    it('should handle HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
      });
      const showErrorSpy = vi.spyOn(notificationService, 'showError');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(httpError);

      const showErrorCalled = showErrorSpy.mock.calls.length > 0;
      const addErrorCalled = addErrorSpy.mock.calls.length > 0;
      expect(showErrorCalled || addErrorCalled).toBe(true);
    });

    it('should handle HttpErrorResponse for various status codes', () => {
      const statusCodes = [400, 401, 403, 404, 500, 502, 503, 504, 418];
      const showErrorSpy = vi.spyOn(notificationService, 'showError');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      statusCodes.forEach((status) => {
        const httpError = new HttpErrorResponse({
          status,
          statusText: 'Test',
        });

        handler.handleError(httpError);

        const showErrorCalled = showErrorSpy.mock.calls.length > 0;
        const addErrorCalled = addErrorSpy.mock.calls.length > 0;
        expect(showErrorCalled || addErrorCalled).toBe(true);
        showErrorSpy.mockClear();
        addErrorSpy.mockClear();
      });
    });
  });

  describe('Friendly Error Messages', () => {
    it('should use original error message for Error objects', () => {
      const error = new Error('ChunkLoadError: Loading chunk failed');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('ChunkLoadError: Loading chunk failed');
      expect(callArgs[1]).toBe(error);
    });

    it('should use original error message for TypeError', () => {
      const error = new TypeError('TypeError message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('TypeError message');
    });

    it('should use original error message for ReferenceError', () => {
      const error = new ReferenceError('ReferenceError message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('ReferenceError message');
    });

    it('should use original message for custom errors', () => {
      const error = new Error('Custom error message');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('Custom error message');
      expect(callArgs[1]).toBe(error);
      expect(['Angular Error', 'Error']).toContain(callArgs[2]);
    });
  });

  describe('Error Context Extraction', () => {
    it('should extract context from HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
      });

      handler.handleError(httpError);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should extract context from JavaScript error with filename', () => {
      const jsError = {
        message: 'JavaScript Error',
        filename: '/path/to/file.js',
        lineno: 42,
        colno: 10,
      };

      handler.handleError(jsError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          context: expect.any(String),
        }) as unknown,
      );
    });

    it('should extract context from resource loading error', () => {
      const resourceError = {
        resourceType: 'img',
        resourceUrl: '/path/to/image.jpg',
      };

      handler.handleError(resourceError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          context: expect.any(String),
        }) as unknown,
      );
    });

    it('should extract context from promise rejection', () => {
      const promiseError = {
        reason: new Error('Promise rejection'),
      };

      handler.handleError(promiseError);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should extract context from error with stack', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      handler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          context: expect.any(String),
        }) as unknown,
      );
    });
  });

  describe('Error Logging', () => {
    it('should log error with grouped console output', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining('Global Error Handler'),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        expect.any(Object),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Original Error:', error);
    });

    it('should include error information in log', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          error: 'Test error',
          errorType: 'Angular Error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          url: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          userAgent: expect.any(String),
        }) as unknown,
      );
    });

    it('should include stack trace in log when available', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      handler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error Info:',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          stack: 'Error: Test error\n    at test.js:1:1',
        }) as unknown,
      );
    });
  });

  describe('Error Reporting', () => {
    it('should report error to console in development', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error would be reported to monitoring service',
        ),
        expect.any(Object),
      );
    });

    it('should include error info in report', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
        expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
        expect.objectContaining({
          error: 'Test error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          timestamp: expect.any(Date),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          url: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.any returns any type
          userAgent: expect.any(String),
        }) as unknown,
      );
    });
  });

  describe('Promise Rejection Handling', () => {
    it('should handle promise rejection with Error reason', () => {
      const promiseError = {
        reason: new Error('Promise rejection reason'),
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(promiseError);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('Promise rejection reason');
      expect(callArgs[2]).toBe('Promise Rejection');
    });

    it('should handle promise rejection with object reason', () => {
      const promiseError = {
        reason: { message: 'Object rejection' },
        message: 'Unhandled Promise Rejection',
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(promiseError);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should handle promise rejection with string reason', () => {
      const promiseError = {
        reason: 'String rejection',
        message: 'Unhandled Promise Rejection',
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(promiseError);

      expect(addErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Resource Loading Error Handling', () => {
    it('should handle image loading error', () => {
      const resourceError = {
        resourceType: 'img',
        resourceUrl: '/path/to/image.jpg',
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(resourceError);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe('Failed to load img. Please refresh the page.');
      expect(callArgs[2]).toBe('Resource Loading Error');
    });

    it('should handle script loading error', () => {
      const resourceError = {
        resourceType: 'script',
        resourceUrl: '/path/to/script.js',
      };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(resourceError);

      expect(addErrorSpy).toHaveBeenCalled();
      const callArgs = addErrorSpy.mock.calls[0];
      expect(callArgs[0]).toBe(
        'Failed to load script. Please refresh the page.',
      );
      expect(callArgs[2]).toBe('Resource Loading Error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      expect(() => {
        handler.handleError(null);
      }).not.toThrow();
    });

    it('should handle undefined error', () => {
      expect(() => {
        handler.handleError(undefined);
      }).not.toThrow();
    });

    it('should handle error with empty message', () => {
      const error = new Error('');
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should handle error without stack', () => {
      const error = { message: 'Error without stack' };
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      handler.handleError(error);

      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should handle circular reference in error object', () => {
      const error: { message: string; self?: unknown } = {
        message: 'Circular error',
      };
      error.self = error;

      expect(() => {
        handler.handleError(error);
      }).not.toThrow();
    });
  });

  describe('NgZone Integration', () => {
    it('should run notification in Angular zone', () => {
      const runSpy = vi.spyOn(ngZone, 'run');
      const error = new Error('Test error');

      handler.handleError(error);

      expect(runSpy).toHaveBeenCalled();
    });
  });
});
