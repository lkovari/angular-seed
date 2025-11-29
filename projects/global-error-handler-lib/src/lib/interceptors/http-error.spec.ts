import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { httpErrorInterceptor } from './http-error';
import { ErrorNotificationService } from '../services/error-notification';

describe('httpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let notificationService: ErrorNotificationService;
  let router: Router;
  let localStorageSpy: Storage;
  let sessionStorageSpy: Storage;

  beforeEach(() => {
    localStorageSpy = {
      removeItem: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;

    sessionStorageSpy = {
      removeItem: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageSpy,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        ErrorNotificationService,
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
            url: '/test',
          },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(ErrorNotificationService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  describe('Successful Requests', () => {
    it('should pass through successful requests unchanged', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      const response = await new Promise((resolve, reject) => {
        httpClient.get('/api/success').subscribe({
          next: resolve,
          error: reject,
        });

        const req = httpMock.expectOne('/api/success');
        req.flush({ data: 'success' });
      });

      expect(response).toEqual({ data: 'success' });
      expect(addErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle HTTP errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      const error = await new Promise<HttpErrorResponse>((resolve, reject) => {
        httpClient.get('/api/error').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: resolve,
        });

        const req = httpMock.expectOne('/api/error');
        req.flush('Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
      });

      expect(error.status).toBe(500);
      expect(addErrorSpy).toHaveBeenCalled();
    });

    it('should re-throw the error after handling', async () => {
      const error = await new Promise<HttpErrorResponse>((resolve, reject) => {
        httpClient.get('/api/error').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: resolve,
        });

        const req = httpMock.expectOne('/api/error');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });

      expect(error).toBeInstanceOf(HttpErrorResponse);
      expect(error.status).toBe(404);
    });
  });

  describe('Status Code 401 - Unauthorized', () => {
    it('should handle 401 errors and clear tokens', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/unauthorized').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'You are not authorized. Please log in again.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(localStorageSpy.removeItem).toHaveBeenCalledWith('token');
            expect(sessionStorageSpy.removeItem).toHaveBeenCalledWith('token');
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/unauthorized');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      });
    });
  });

  describe('Status Code 403 - Forbidden', () => {
    it('should handle 403 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/forbidden').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'You do not have permission to perform this action.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/forbidden');
        req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      });
    });
  });

  describe('Status Code 404 - Not Found', () => {
    it('should handle 404 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/not-found').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'The requested resource was not found.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/not-found');
        req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      });
    });
  });

  describe('Status Code 500 - Internal Server Error', () => {
    it('should handle 500 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/server-error').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Internal server error. Please try again later.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/server-error');
        req.flush('Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
      });
    });
  });

  describe('Status Code 502, 503, 504 - Server Errors', () => {
    it('should handle 502 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/error-502').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Service temporarily unavailable. Please try again later.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/error-502');
        req.flush('Bad Gateway', { status: 502, statusText: 'Bad Gateway' });
      });
    });

    it('should handle 503 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/error-503').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Service temporarily unavailable. Please try again later.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/error-503');
        req.flush('Service Unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    });

    it('should handle 504 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/error-504').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Service temporarily unavailable. Please try again later.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/error-504');
        req.flush('Gateway Timeout', {
          status: 504,
          statusText: 'Gateway Timeout',
        });
      });
    });
  });

  describe('Status Code 0 - Network Error', () => {
    it('should handle network errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/network-error').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Unable to connect to the server. Please check your internet connection.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/network-error');
        req.error(new ProgressEvent('error'), {
          status: 0,
          statusText: 'Unknown Error',
        });
      });
    });
  });

  describe('Status Code 400 - Bad Request', () => {
    it('should handle 400 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/bad-request').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Invalid request. Please check your input and try again.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/bad-request');
        req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      });
    });
  });

  describe('Status Code 402 - Payment Required', () => {
    it('should handle 402 errors', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/payment-required').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'Payment required. Please complete payment to continue.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/payment-required');
        req.flush('Payment Required', {
          status: 402,
          statusText: 'Payment Required',
        });
      });
    });
  });

  describe('Unknown Status Codes', () => {
    it('should handle unknown status codes with generic message', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/unknown-error').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledWith(
              'An error occurred (418). Please try again.',
              expect.any(HttpErrorResponse),
              'HttpError',
            );
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/unknown-error');
        req.flush("I'm a teapot", { status: 418, statusText: "I'm a teapot" });
      });
    });
  });

  describe('Error Notification Service Integration', () => {
    it('should call addErrorWithCallStack with correct parameters', async () => {
      const addErrorSpy = vi.spyOn(
        notificationService,
        'addErrorWithCallStack',
      );

      await new Promise<void>((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should have errored')),
          error: () => {
            expect(addErrorSpy).toHaveBeenCalledTimes(1);
            const callArgs = addErrorSpy.mock.calls[0];
            expect(callArgs[0]).toBe(
              'Internal server error. Please try again later.',
            );
            expect(callArgs[1]).toBeInstanceOf(HttpErrorResponse);
            expect(callArgs[2]).toBe('HttpError');
            resolve();
          },
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Error', {
          status: 500,
          statusText: 'Internal Server Error',
        });
      });
    });
  });
});

