import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingIndicatorService } from './loading-indicator.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingIndicatorService);

  loadingService.showWaitSpinner();

  return next(req).pipe(
    finalize(() => {
      loadingService.hideWaitSpinner();
    }),
  );
};
