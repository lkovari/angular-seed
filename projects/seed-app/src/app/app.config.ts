import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideErrorHandling } from 'global-error-handler-lib';
import { loadingInterceptor } from 'seed-common-lib';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loadingInterceptor])
    ),
    ...provideErrorHandling({
      enableGlobalHandler: true,
      enableHttpInterceptor: true,
      enableNotifications: true,
      production: false
    })
  ],
};
