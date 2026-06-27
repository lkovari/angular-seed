import {
  type ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import { provideErrorHandling } from '../../../global-error-handler-lib/src/public-api';
import {
  correlationIdInterceptor,
  loadingInterceptor,
} from '../../../seed-common-lib/src/public-api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withXhr(),
      withInterceptors([correlationIdInterceptor, loadingInterceptor]),
    ),
    ...provideErrorHandling({
      enableGlobalHandler: true,
      enableHttpInterceptor: true,
      enableNotifications: true,
      production: false,
    }),
  ],
};
