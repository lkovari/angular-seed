import { InjectionToken } from '@angular/core';

export type ThemeTranslateFn = (key: string) => string;

export const THEME_TRANSLATE = new InjectionToken<ThemeTranslateFn>(
  'THEME_TRANSLATE',
  {
    factory: () => (key: string) => key,
  },
);
