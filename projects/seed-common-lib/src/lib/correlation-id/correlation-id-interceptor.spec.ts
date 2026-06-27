import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  HttpRequest,
  type HttpHandler,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { of } from 'rxjs';
import { correlationIdInterceptor } from './correlation-id-interceptor';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';

function createMockHttpHandler(
  handleSpy: ReturnType<typeof vi.fn>,
): HttpHandler {
  return {
    handle: handleSpy,
  };
}

function getInterceptedRequest(
  handleSpy: ReturnType<typeof vi.fn>,
): HttpRequest<unknown> | undefined {
  const firstCall = handleSpy.mock.calls.at(0);
  if (!Array.isArray(firstCall)) {
    return undefined;
  }
  const request: unknown = firstCall[0];
  return request instanceof HttpRequest ? request : undefined;
}

describe('correlationIdInterceptor', () => {
  let interceptor: typeof correlationIdInterceptor;
  let nextHandler: HttpHandler;
  let handleSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    interceptor = correlationIdInterceptor;
    handleSpy = vi.fn();
    nextHandler = createMockHttpHandler(handleSpy);
  });

  it('should add X-Correlation-ID header to request', () => {
    const request = new HttpRequest('GET', '/api/test');
    vi.mocked(handleSpy).mockReturnValue(
      of(new HttpResponse({ status: 200 })),
    );

    interceptor(request, (req) => {
      return nextHandler.handle(req);
    }).subscribe();

    expect(handleSpy).toHaveBeenCalled();
    const interceptedRequest = getInterceptedRequest(handleSpy);
    expect(interceptedRequest?.headers.has(CORRELATION_ID_HEADER)).toBe(true);
    expect(interceptedRequest?.headers.get(CORRELATION_ID_HEADER)).toBeTruthy();
  });

  it('should generate unique correlation IDs for different requests', () => {
    const request1 = new HttpRequest('GET', '/api/test1');
    const request2 = new HttpRequest('GET', '/api/test2');
    const correlationIds: string[] = [];

    vi.mocked(handleSpy).mockImplementation(
      (req: HttpRequest<unknown>) => {
        correlationIds.push(req.headers.get(CORRELATION_ID_HEADER) ?? '');
        return of(new HttpResponse({ status: 200 }));
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
    vi.mocked(handleSpy).mockReturnValue(
      of(new HttpResponse({ status: 200 })),
    );

    interceptor(request, (req) => {
      return nextHandler.handle(req);
    }).subscribe();

    const interceptedRequest = getInterceptedRequest(handleSpy);
    expect(interceptedRequest?.headers.has(CORRELATION_ID_HEADER)).toBe(true);
    expect(interceptedRequest?.headers.get('Authorization')).toBe(
      'Bearer token123',
    );
  });
});
