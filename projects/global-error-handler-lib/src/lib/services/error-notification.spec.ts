import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorNotificationService } from './error-notification';

describe('ErrorNotificationService', () => {
  let service: ErrorNotificationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorNotificationService,
        provideRouter([
          { path: 'test-route', component: class {} },
        ]),
      ],
    });

    service = TestBed.inject(ErrorNotificationService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    service.clearErrorHistory();
    service.dismissAll();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have empty notifications signal initially', () => {
      expect(service.notificationsSignal()).toEqual([]);
    });

    it('should have empty error history signal initially', () => {
      expect(service.errorHistorySignal()).toEqual([]);
    });
  });

  describe('showError', () => {
    it('should add error notification', () => {
      const id = service.showError('Test error message');

      expect(id).toBeDefined();
      expect(service.notificationsSignal().length).toBe(1);
      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Test error message');
      expect(notification.type).toBe('error');
      expect(notification.autoHide).toBe(true);
      expect(notification.duration).toBe(5000);
    });

    it('should add error to history', () => {
      service.showError('Test error');

      expect(service.errorHistorySignal().length).toBe(1);
      expect(service.errorHistorySignal()[0].message).toBe('Test error');
    });

    it('should use custom duration', () => {
      const id = service.showError('Test error', 3000);

      const notification = service.notificationsSignal()[0];
      expect(notification.duration).toBe(3000);
    });

    it('should generate call stack', () => {
      service.showError('Test error');

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
      expect(Array.isArray(notification.callStack)).toBe(true);
      expect(notification.callStack!.length).toBeGreaterThan(0);
    });

    it('should include route information', () => {
      service.showError('Test error');

      const notification = service.notificationsSignal()[0];
      expect(notification.route).toBeDefined();
    });

    it('should include error context', () => {
      service.showError('Test error');

      const notification = service.notificationsSignal()[0];
      expect(notification.errorContext).toBeDefined();
      expect(notification.errorContext?.errorType).toBe('ManualError');
    });
  });

  describe('showWarning', () => {
    it('should add warning notification', () => {
      const id = service.showWarning('Test warning');

      expect(id).toBeDefined();
      expect(service.notificationsSignal().length).toBe(1);
      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Test warning');
      expect(notification.type).toBe('warning');
      expect(notification.autoHide).toBe(true);
      expect(notification.duration).toBe(4000);
    });

    it('should use custom duration', () => {
      service.showWarning('Test warning', 2000);

      const notification = service.notificationsSignal()[0];
      expect(notification.duration).toBe(2000);
    });

    it('should NOT add warning to error history', () => {
      service.showWarning('Test warning');

      expect(service.errorHistorySignal().length).toBe(0);
    });
  });

  describe('showInfo', () => {
    it('should add info notification', () => {
      const id = service.showInfo('Test info');

      expect(id).toBeDefined();
      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Test info');
      expect(notification.type).toBe('info');
      expect(notification.duration).toBe(3000);
    });

    it('should use custom duration', () => {
      service.showInfo('Test info', 1000);

      const notification = service.notificationsSignal()[0];
      expect(notification.duration).toBe(1000);
    });
  });

  describe('showSuccess', () => {
    it('should add success notification', () => {
      const id = service.showSuccess('Test success');

      expect(id).toBeDefined();
      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Test success');
      expect(notification.type).toBe('success');
      expect(notification.duration).toBe(3000);
    });

    it('should use custom duration', () => {
      service.showSuccess('Test success', 2000);

      const notification = service.notificationsSignal()[0];
      expect(notification.duration).toBe(2000);
    });
  });

  describe('showPersistent', () => {
    it('should add persistent notification', () => {
      const id = service.showPersistent('Persistent message');

      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Persistent message');
      expect(notification.autoHide).toBe(false);
      expect(notification.duration).toBe(5000);
    });

    it('should support custom type', () => {
      service.showPersistent('Warning message', 'warning');

      const notification = service.notificationsSignal()[0];
      expect(notification.type).toBe('warning');
    });

    it('should support action handler', () => {
      const actionHandler = vi.fn();
      const action = {
        label: 'Retry',
        handler: actionHandler,
      };

      service.showPersistent('Error message', 'error', action);

      const notification = service.notificationsSignal()[0];
      expect(notification.action).toBeDefined();
      expect(notification.action?.label).toBe('Retry');

      notification.action?.handler();
      expect(actionHandler).toHaveBeenCalled();
    });
  });

  describe('addErrorWithCallStack', () => {
    it('should add error with call stack from Error object', () => {
      const error = new Error('Test error');
      const id = service.addErrorWithCallStack('Error message', error);

      expect(id).toBeDefined();
      const notification = service.notificationsSignal()[0];
      expect(notification.message).toBe('Error message');
      expect(notification.callStack).toBeDefined();
      expect(Array.isArray(notification.callStack)).toBe(true);
    });

    it('should add error to history', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error);

      expect(service.errorHistorySignal().length).toBe(1);
    });

    it('should extract HTTP status from HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
      });

      service.addErrorWithCallStack('HTTP Error', httpError);

      const notification = service.notificationsSignal()[0];
      expect(notification.httpStatus).toBe(404);
    });

    it('should extract HTTP status from nested error', () => {
      const httpError = {
        error: { status: 500 },
      };

      service.addErrorWithCallStack('HTTP Error', httpError);

      const notification = service.notificationsSignal()[0];
      expect(notification.httpStatus).toBe(500);
    });

    it('should use custom error type', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error, 'CustomError');

      const notification = service.notificationsSignal()[0];
      expect(notification.errorContext?.errorType).toBe('CustomError');
    });

    it('should infer error type from error constructor', () => {
      const error = new TypeError('Type error');
      service.addErrorWithCallStack('Error message', error);

      const notification = service.notificationsSignal()[0];
      expect(notification.errorContext?.errorType).toBeDefined();
      expect(['TypeError', 'Unknown']).toContain(notification.errorContext?.errorType);
    });

    it('should use custom duration', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error, undefined, 10000);

      const notification = service.notificationsSignal()[0];
      expect(notification.duration).toBe(10000);
    });

    it('should generate call stack when error has no stack', () => {
      const errorWithoutStack = { message: 'Error without stack' };
      service.addErrorWithCallStack('Error message', errorWithoutStack);

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
      expect(Array.isArray(notification.callStack)).toBe(true);
    });

    it('should include error context with URL and userAgent', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error);

      const notification = service.notificationsSignal()[0];
      expect(notification.errorContext).toBeDefined();
      expect(notification.errorContext?.url).toBeDefined();
      expect(notification.errorContext?.userAgent).toBeDefined();
    });
  });

  describe('dismiss', () => {
    it('should remove notification by id', () => {
      const id1 = service.showError('Error 1');
      const id2 = service.showWarning('Warning 1');

      expect(service.notificationsSignal().length).toBe(2);

      service.dismiss(id1);

      const notifications = service.notificationsSignal();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(id2);
    });

    it('should not throw when dismissing non-existent id', () => {
      expect(() => service.dismiss('non-existent-id')).not.toThrow();
    });
  });

  describe('dismissAll', () => {
    it('should remove all notifications', () => {
      service.showError('Error 1');
      service.showWarning('Warning 1');
      service.showInfo('Info 1');

      expect(service.notificationsSignal().length).toBe(3);

      service.dismissAll();

      expect(service.notificationsSignal().length).toBe(0);
    });
  });

  describe('Error History', () => {
    it('should track errors in history', () => {
      service.showError('Error 1');
      service.showError('Error 2');

      expect(service.errorHistorySignal().length).toBe(2);
    });

    it('should NOT track warnings in history', () => {
      service.showWarning('Warning 1');
      service.showInfo('Info 1');
      service.showSuccess('Success 1');

      expect(service.errorHistorySignal().length).toBe(0);
    });

    it('should track errors with call stack in history', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error);

      expect(service.errorHistorySignal().length).toBe(1);
      expect(service.errorHistorySignal()[0].callStack).toBeDefined();
    });

    it('should get all errors from history', () => {
      service.showError('Error 1');
      service.showError('Error 2');

      const allErrors = service.getAllErrors();
      expect(allErrors.length).toBe(2);
      expect(allErrors).toEqual(service.errorHistorySignal());
    });

    it('should clear error history', () => {
      service.showError('Error 1');
      service.showError('Error 2');

      expect(service.errorHistorySignal().length).toBe(2);

      service.clearErrorHistory();

      expect(service.errorHistorySignal().length).toBe(0);
    });

    it('should clear history using clearHistory alias', () => {
      service.showError('Error 1');
      service.showError('Error 2');

      expect(service.errorHistorySignal().length).toBe(2);

      service.clearHistory();

      expect(service.errorHistorySignal().length).toBe(0);
    });
  });

  describe('Auto-hide Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-hide notification after duration', () => {
      service.showError('Test error', 1000);

      expect(service.notificationsSignal().length).toBe(1);

      vi.advanceTimersByTime(1000);

      expect(service.notificationsSignal().length).toBe(0);
    });

    it('should NOT auto-hide persistent notifications', () => {
      service.showPersistent('Persistent message');

      expect(service.notificationsSignal().length).toBe(1);

      vi.advanceTimersByTime(10000);

      expect(service.notificationsSignal().length).toBe(1);
    });

    it('should auto-hide multiple notifications independently', () => {
      service.showError('Error 1', 1000);
      service.showWarning('Warning 1', 2000);

      expect(service.notificationsSignal().length).toBe(2);

      vi.advanceTimersByTime(1000);

      expect(service.notificationsSignal().length).toBe(1);
      expect(service.notificationsSignal()[0].message).toBe('Warning 1');

      vi.advanceTimersByTime(1000);

      expect(service.notificationsSignal().length).toBe(0);
    });
  });

  describe('Notification ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = service.showError('Error 1');
      const id2 = service.showWarning('Warning 1');
      const id3 = service.showInfo('Info 1');

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with error- prefix', () => {
      const id = service.showError('Error');
      expect(id).toMatch(/^error-\d+$/);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update notificationsSignal when notification is added', () => {
      const initialLength = service.notificationsSignal().length;

      service.showError('Test error');

      expect(service.notificationsSignal().length).toBe(initialLength + 1);
    });

    it('should update errorHistorySignal when error is added', () => {
      const initialLength = service.errorHistorySignal().length;

      service.showError('Test error');

      expect(service.errorHistorySignal().length).toBe(initialLength + 1);
    });

    it('should update notificationsSignal when notification is dismissed', () => {
      const id = service.showError('Test error');
      expect(service.notificationsSignal().length).toBe(1);

      service.dismiss(id);

      expect(service.notificationsSignal().length).toBe(0);
    });
  });

  describe('Route Tracking', () => {
    it('should track current route when notification is created', () => {
      service.showError('Test error');

      const notification = service.notificationsSignal()[0];
      expect(notification.route).toBeDefined();
    });

    it('should handle router errors gracefully', () => {
      Object.defineProperty(service, 'router', {
        value: null,
        writable: true,
        configurable: true,
      });

      expect(() => {
        service.showError('Test error');
      }).not.toThrow();
    });
  });

  describe('Call Stack Extraction', () => {
    it('should extract call stack from Error object', () => {
      const error = new Error('Test error');
      service.addErrorWithCallStack('Error message', error);

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
      expect(notification.callStack!.length).toBeGreaterThan(0);
    });

    it('should handle error without stack property', () => {
      const errorWithoutStack = { message: 'No stack' };
      service.addErrorWithCallStack('Error message', errorWithoutStack);

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
      expect(Array.isArray(notification.callStack)).toBe(true);
    });

    it('should handle string error', () => {
      service.addErrorWithCallStack('Error message', 'String error');

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
    });

    it('should handle undefined error', () => {
      service.addErrorWithCallStack('Error message', undefined);

      const notification = service.notificationsSignal()[0];
      expect(notification.callStack).toBeDefined();
      expect(Array.isArray(notification.callStack)).toBe(true);
    });
  });

  describe('Multiple Notifications', () => {
    it('should handle multiple notifications of different types', () => {
      service.showError('Error 1');
      service.showWarning('Warning 1');
      service.showInfo('Info 1');
      service.showSuccess('Success 1');

      expect(service.notificationsSignal().length).toBe(4);
    });

    it('should maintain notification order', () => {
      const id1 = service.showError('Error 1');
      const id2 = service.showWarning('Warning 1');
      const id3 = service.showInfo('Info 1');

      const notifications = service.notificationsSignal();
      expect(notifications[0].id).toBe(id1);
      expect(notifications[1].id).toBe(id2);
      expect(notifications[2].id).toBe(id3);
    });
  });

  describe('HTTP Error Handling', () => {
    it('should extract HTTP status from HttpErrorResponse', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        url: '/api/test',
      });

      service.addErrorWithCallStack('HTTP Error', httpError);

      const notification = service.notificationsSignal()[0];
      expect(notification.httpStatus).toBe(500);
    });

    it('should handle HttpErrorResponse with nested error', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/test',
        error: { message: 'Resource not found' },
      });

      service.addErrorWithCallStack('HTTP Error', httpError);

      const notification = service.notificationsSignal()[0];
      expect(notification.httpStatus).toBe(404);
    });
  });
});

