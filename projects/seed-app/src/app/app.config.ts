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
import { provideI18n } from '../../../seed-i18n-lib/src/public-api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withXhr(),
      withInterceptors([correlationIdInterceptor, loadingInterceptor]),
    ),
    ...provideI18n({
      defaultLocale: 'en',
      supportedLocales: ['en', 'hu', 'de'],
    }),
    ...provideErrorHandling({
      enableGlobalHandler: true,
      enableHttpInterceptor: true,
      enableNotifications: true,
      production: false,
    }),
  ],
};
