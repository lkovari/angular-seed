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
      expect(() => component.throwSimpleError()).toThrow(
        'This is a simple JavaScript error for testing',
      );
    });

    it('should throw a TypeError when throwTypeError is called', () => {
      expect(() => component.throwTypeError()).toThrow();
    });

    it('should throw a ReferenceError when throwReferenceError is called', () => {
      expect(() => component.throwReferenceError()).toThrow();
    });

    it('should trigger async error when throwAsyncError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      window.addEventListener('unhandledrejection', unhandledRejectionHandler, {
        capture: true,
      });

      const originalStderrWrite = process.stderr?.write;
      if (process.stderr) {
        process.stderr.write = vi.fn() as typeof process.stderr.write;
      }

      // Also handle Node.js unhandled rejections
      const nodeRejectionHandler = () => {};
      process.on('unhandledRejection', nodeRejectionHandler);

      expect(() => component.throwAsyncError()).not.toThrow();

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

      if (process.stderr && originalStderrWrite) {
        process.stderr.write = originalStderrWrite;
      }

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should create rejected promise when throwPromiseError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', unhandledRejectionHandler);

      const originalStderrWrite = process.stderr?.write;
      if (process.stderr) {
        process.stderr.write = vi.fn() as typeof process.stderr.write;
      }

      expect(() => component.throwPromiseError()).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      window.removeEventListener(
        'unhandledrejection',
        unhandledRejectionHandler,
      );

      if (process.stderr && originalStderrWrite) {
        process.stderr.write = originalStderrWrite;
      }

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should schedule timeout error when throwTimeoutError is called', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const errorHandler = (event: ErrorEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Use capture phase to catch the error
      window.addEventListener('error', errorHandler, true);

      const originalStderrWrite = process.stderr?.write;
      if (process.stderr) {
        process.stderr.write = vi.fn() as typeof process.stderr.write;
      }

      // Also handle Node.js uncaught exceptions
      const nodeErrorHandler = () => {};
      process.on('uncaughtException', nodeErrorHandler);

      expect(() => component.throwTimeoutError()).not.toThrow();

      // Wait for the setTimeout error to occur
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Keep handler active a bit longer to catch any late errors
      await new Promise((resolve) => setTimeout(resolve, 50));

      process.removeListener('uncaughtException', nodeErrorHandler);
      window.removeEventListener('error', errorHandler, true);

      if (process.stderr && originalStderrWrite) {
        process.stderr.write = originalStderrWrite;
      }

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('HTTP Errors', () => {
    it('should trigger HTTP 404 error when triggerHttp404 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerHttp404();

      const req = httpMock.expectOne('/api/non-existent-endpoint');
      expect(req.request.method).toBe('GET');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 500 error when triggerHttp500 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerHttp500();

      const req = httpMock.expectOne('https://httpbin.org/status/500');
      expect(req.request.method).toBe('GET');
      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 401 error when triggerHttp401 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerHttp401();

      const req = httpMock.expectOne('https://httpbin.org/status/401');
      expect(req.request.method).toBe('GET');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 402 error when triggerHttp402 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerHttp402();

      const req = httpMock.expectOne('https://httpbin.org/status/402');
      expect(req.request.method).toBe('GET');
      req.flush('Payment Required', {
        status: 402,
        statusText: 'Payment Required',
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger HTTP 403 error when triggerHttp403 is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerHttp403();

      const req = httpMock.expectOne('https://httpbin.org/status/403');
      expect(req.request.method).toBe('GET');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should trigger network error when triggerNetworkError is called', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      component.triggerNetworkError();

      const req = httpMock.expectOne(
        'https://invalid-domain-that-does-not-exist-12345.com/api',
      );
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));

      expect(consoleErrorSpy).toHaveBeenCalled();
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
