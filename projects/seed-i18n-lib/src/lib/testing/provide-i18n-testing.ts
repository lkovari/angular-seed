import { type Provider } from '@angular/core';
import { DEFAULT_I18N_CONFIG, type I18nConfig } from '../models/i18n-config';
import { I18N_CONFIG } from '../models/i18n-config.token';

export function provideI18nTesting(
  config: Partial<I18nConfig> = {},
): Provider {
  return {
    provide: I18N_CONFIG,
    useValue: { ...DEFAULT_I18N_CONFIG, ...config },
  };
}
