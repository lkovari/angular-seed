import {
  inject,
  provideAppInitializer,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { DEFAULT_I18N_CONFIG, type I18nConfig } from '../models/i18n-config';
import { I18N_CONFIG } from '../models/i18n-config.token';
import { TranslationService } from '../services/translation.service';

export function provideI18n(
  config: Partial<I18nConfig> = {},
): (Provider | EnvironmentProviders)[] {
  const finalConfig: I18nConfig = { ...DEFAULT_I18N_CONFIG, ...config };

  return [
    { provide: I18N_CONFIG, useValue: finalConfig },
    provideAppInitializer(() => {
      const translationService = inject(TranslationService);
      return translationService.initialize();
    }),
  ];
}
