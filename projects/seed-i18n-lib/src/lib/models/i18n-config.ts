import { type SupportedLocale } from './supported-locale';

export interface I18nConfig {
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  assetsPath: string;
  storageKey: string;
  fallbackLocale: SupportedLocale;
  production: boolean;
}

export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'hu', 'de'],
  assetsPath: '/assets/i18n',
  storageKey: 'seed-app.locale',
  fallbackLocale: 'en',
  production: false,
};
