import {
  inject,
  provideAppInitializer,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { DEFAULT_THEME_CONFIG, type ThemeConfig } from '../models/theme-config';
import { THEME_CONFIG } from '../models/theme-config.token';
import { ThemeService } from '../services/theme.service';

export function provideTheme(
  config: Partial<ThemeConfig> = {},
): (Provider | EnvironmentProviders)[] {
  const finalConfig: ThemeConfig = { ...DEFAULT_THEME_CONFIG, ...config };

  return [
    { provide: THEME_CONFIG, useValue: finalConfig },
    provideAppInitializer(() => {
      const themeService = inject(ThemeService);
      themeService.initialize();
    }),
  ];
}
