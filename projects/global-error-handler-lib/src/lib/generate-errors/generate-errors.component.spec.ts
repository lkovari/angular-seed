import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ErrorNotificationService } from '../services/error-notification';

import { GenerateErrorsComponent } from './generate-errors.component';

describe('GenerateErrorsComponent', () => {
  let component: GenerateErrorsComponent;
  let fixture: ComponentFixture<GenerateErrorsComponent>;
  let httpMock: HttpTestingController;
  let notificationService: ErrorNotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateErrorsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ErrorNotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateErrorsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(ErrorNotificationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('JavaScript Errors', () => {
    it('should throw a simple error when throwSimpleError is called', () => {
      expect(() => {
        component.throwSimpleError();
      }).toThrow('This is a simple JavaScript error for testing');
    });

    it('should throw a TypeError when throwTypeError is called', () => {
      expect(() => {
        component.throwTypeError();
      }).toThrow();
    });

    it('should throw a ReferenceError when throwReferenceError is called', () => {
      expect(() => {
        component.throwReferenceError();
      }).toThrow();
    });

    it('should trigger async error when throwAsyncError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          // Mock implementation
        });

      const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      window.addEventListener('unhandledrejection', unhandledRejectionHandler, {
        capture: true,
      });

      const originalStderrWrite = process.stderr.write.bind(process.stderr);
      process.stderr.write = vi.fn() as typeof process.stderr.write;

      // Also handle Node.js unhandled rejections
      function noOpRejectionHandler(): void {
        // Intentionally empty - suppresses unhandled rejection events in tests
      }
      const nodeRejectionHandler = noOpRejectionHandler;
      process.on('unhandledRejection', nodeRejectionHandler);

      expect(() => {
        component.throwAsyncError();
      }).not.toThrow();

      // Wait for the async error to occur
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Keep handler active a bit longer to catch any late rejections
      await new Promise((resolve) => setTimeout(resolve, 50));

      process.removeListener('unhandledRejection', nodeRejectionHandler);
      window.removeEventListener(
        'unhandledrejection',
        unhandledRejectionHandler,
        {
          capture: true,
        },
      );

      process.stderr.write = originalStderrWrite;

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should create rejected promise when throwPromiseError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          // Mock implementation
        });

      const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', unhandledRejectionHandler);

      const originalStderrWrite = process.stderr.write.bind(process.stderr);
      process.stderr.write = vi.fn() as typeof process.stderr.write;

      expect(() => {
        component.throwPromiseError();
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      window.removeEventListener(
        'unhandledrejection',
        unhandledRejectionHandler,
      );

      process.stderr.write = originalStderrWrite;

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should schedule timeout error when throwTimeoutError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {
          // Mock implementation
        });

      const errorHandler = (event: ErrorEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Use capture phase to catch the error
      window.addEventListener('error', errorHandler, true);

      const originalStderrWrite = process.stderr.write.bind(process.stderr);
      process.stderr.write = vi.fn() as typeof process.stderr.write;

      // Also handle Node.js uncaught exceptions
      function noOpErrorHandler(): void {
        // Intentionally empty - suppresses uncaught exception events in tests
      }
      const nodeErrorHandler = noOpErrorHandler;
      process.on('uncaughtException', nodeErrorHandler);

      expect(() => {
        component.throwTimeoutError();
      }).not.toThrow();

      // Wait for the setTimeout error to occur
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Keep handler active a bit longer to catch any late errors
      await new Promise((resolve) => setTimeout(resolve, 50));

      process.removeListener('uncaughtException', nodeErrorHandler);
      window.removeEventListener('error', errorHandler, true);

      process.stderr.write = originalStderrWrite;

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('HTTP Errors', () => {
    it('should trigger HTTP 404 error when triggerHttp404 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerHttp404();

      const req = httpMock.expectOne('/api/non-existent-endpoint');
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 500 error when triggerHttp500 is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerHttp500();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 100 },
      );

      const errorCall = consoleErrorSpy.mock.calls[0]?.[0] as string;
      expect(errorCall).toContain('HTTP 500 Error caught');
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 401 error when triggerHttp401 is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerHttp401();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 100 },
      );

      const errorCall = consoleErrorSpy.mock.calls[0]?.[0] as string;
      expect(errorCall).toContain('HTTP 401 Error caught');
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 402 error when triggerHttp402 is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerHttp402();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 100 },
      );

      const errorCall = consoleErrorSpy.mock.calls[0]?.[0] as string;
      expect(errorCall).toContain('HTTP 402 Error caught');
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 403 error when triggerHttp403 is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerHttp403();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 100 },
      );

      const errorCall = consoleErrorSpy.mock.calls[0]?.[0] as string;
      expect(errorCall).toContain('HTTP 403 Error caught');
      consoleErrorSpy.mockRestore();
    });

    it('should trigger network error when triggerNetworkError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {
          // Mock implementation
        });

      component.triggerNetworkError();

      await vi.waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 100 },
      );

      const errorCall = consoleErrorSpy.mock.calls[0]?.[0] as string;
      expect(errorCall).toContain('Network Error caught');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Notifications', () => {
    it('should trigger error notification when triggerCustomNotification is called', () => {
      const showErrorSpy = vi.spyOn(notificationService, 'showError');

      component.triggerCustomNotification();

      expect(showErrorSpy).toHaveBeenCalledWith(
        'This is a custom error notification',
        5000,
      );
    });

    it('should trigger warning notification when triggerWarningNotification is called', () => {
      const showWarningSpy = vi.spyOn(notificationService, 'showWarning');

      component.triggerWarningNotification();

      expect(showWarningSpy).toHaveBeenCalledWith(
        'This is a warning notification',
        4000,
      );
    });

    it('should trigger info notification when triggerInfoNotification is called', () => {
      const showInfoSpy = vi.spyOn(notificationService, 'showInfo');

      component.triggerInfoNotification();

      expect(showInfoSpy).toHaveBeenCalledWith(
        'This is an info notification',
        3000,
      );
    });

    it('should trigger success notification when triggerSuccessNotification is called', () => {
      const showSuccessSpy = vi.spyOn(notificationService, 'showSuccess');

      component.triggerSuccessNotification();

      expect(showSuccessSpy).toHaveBeenCalledWith(
        'This is a success notification',
        3000,
      );
    });
  });

  describe('Advanced Testing', () => {
    it('should trigger error with call stack when throwErrorWithCallStack is called', () => {
      const addErrorWithCallStackSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      component.throwErrorWithCallStack();

      expect(addErrorWithCallStackSpy).toHaveBeenCalledWith(
        'Error with call stack captured',
        expect.any(Error),
        'CustomError',
      );
    });
  });
});
