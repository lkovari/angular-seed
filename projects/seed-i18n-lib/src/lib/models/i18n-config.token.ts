import { InjectionToken } from '@angular/core';
import { DEFAULT_I18N_CONFIG, type I18nConfig } from './i18n-config';

export const I18N_CONFIG = new InjectionToken<I18nConfig>('I18N_CONFIG', {
  factory: () => DEFAULT_I18N_CONFIG,
});
