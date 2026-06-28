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
import { provideTheme } from '../../../seed-theme-lib/src/public-api';
import { provideThemeTranslate } from './shared/adapters/theme-translate.adapter';

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
    ...provideTheme({
      defaultTheme: 'azure',
      supportedThemes: ['azure', 'meadow', 'magenta-dream'],
    }),
    provideThemeTranslate(),
    ...provideErrorHandling({
      enableGlobalHandler: true,
      enableHttpInterceptor: true,
      enableNotifications: true,
      production: false,
    }),
  ],
};
