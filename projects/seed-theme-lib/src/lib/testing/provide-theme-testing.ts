import { type Provider } from '@angular/core';
import { DEFAULT_THEME_CONFIG, type ThemeConfig } from '../models/theme-config';
import { THEME_CONFIG } from '../models/theme-config.token';
import { THEME_TRANSLATE } from '../models/theme-translate.token';

export function provideThemeTesting(
  config: Partial<ThemeConfig> = {},
): Provider[] {
  return [
    {
      provide: THEME_CONFIG,
      useValue: { ...DEFAULT_THEME_CONFIG, ...config },
    },
    {
      provide: THEME_TRANSLATE,
      useValue: (key: string) => key,
    },
  ];
}
