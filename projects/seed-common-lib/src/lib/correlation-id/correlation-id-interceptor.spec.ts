import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HttpRequest,
  type HttpHandler,
  HttpHeaders,
  type HttpEvent,
} from '@angular/common/http';
import { of } from 'rxjs';
import { correlationIdInterceptor } from './correlation-id-interceptor';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';

describe('correlationIdInterceptor', () => {
  let interceptor: typeof correlationIdInterceptor;
  let nextHandler: HttpHandler;
  let handleSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    interceptor = correlationIdInterceptor;
    handleSpy = vi.fn();
    nextHandler = {
      handle: handleSpy,
    } as unknown as HttpHandler;
  });

  it('should add X-Correlation-ID header to request', () => {
    const request = new HttpRequest('GET', '/api/test');
    vi.mocked(handleSpy).mockReturnValue(of({} as HttpEvent<unknown>));

    interceptor(request, (req) => {
      return nextHandler.handle(req);
    }).subscribe();

    expect(handleSpy).toHaveBeenCalled();
    const interceptedRequest = vi.mocked(handleSpy).mock
      .calls[0][0] as HttpRequest<unknown>;
    expect(interceptedRequest.headers.has(CORRELATION_ID_HEADER)).toBe(true);
    expect(interceptedRequest.headers.get(CORRELATION_ID_HEADER)).toBeTruthy();
  });

  it('should generate unique correlation IDs for different requests', () => {
    const request1 = new HttpRequest('GET', '/api/test1');
    const request2 = new HttpRequest('GET', '/api/test2');
    const correlationIds: string[] = [];

    vi.mocked(handleSpy).mockImplementation(
      (req: HttpRequest<unknown>) => {
        correlationIds.push(req.headers.get(CORRELATION_ID_HEADER) ?? '');
        return of({} as HttpEvent<unknown>);
      },
    );

    interceptor(request1, (req) => {
      return nextHandler.handle(req);
    }).subscribe();
    interceptor(request2, (req) => {
      return nextHandler.handle(req);
    }).subscribe();

    expect(correlationIds.length).toBe(2);
    expect(correlationIds[0]).toBeTruthy();
    expect(correlationIds[1]).toBeTruthy();
    expect(correlationIds[0]).not.toBe(correlationIds[1]);
  });

  it('should preserve existing headers', () => {
    const headers = new HttpHeaders({ Authorization: 'Bearer token123' });
    const request = new HttpRequest('GET', '/api/test', null, { headers });
    vi.mocked(handleSpy).mockReturnValue(of({} as HttpEvent<unknown>));

    interceptor(request, (req) => {
      return nextHandler.handle(req);
    }).subscribe();

    const interceptedRequest = vi.mocked(handleSpy).mock
      .calls[0][0] as HttpRequest<unknown>;
    expect(interceptedRequest.headers.has(CORRELATION_ID_HEADER)).toBe(true);
    expect(interceptedRequest.headers.get('Authorization')).toBe(
      'Bearer token123',
    );
  });
});
