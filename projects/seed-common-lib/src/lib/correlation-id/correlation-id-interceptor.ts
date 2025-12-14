import { type HttpInterceptorFn } from '@angular/common/http';
import { CORRELATION_ID_HEADER } from './correlation-id.constants';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = generateCorrelationId();
  const clonedRequest = req.clone({
    setHeaders: {
      [CORRELATION_ID_HEADER]: correlationId,
    },
  });

  return next(clonedRequest);
};

function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID !== undefined) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
