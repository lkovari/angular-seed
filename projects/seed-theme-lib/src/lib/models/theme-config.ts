import { type ThemeId } from './theme-id';

export interface ThemeConfig {
  defaultTheme: ThemeId;
  supportedThemes: ThemeId[];
  themeStorageKey: string;
  autoColorModeStorageKey: string;
  manualColorModeStorageKey: string;
  fallbackLightStartHour: number;
  fallbackLightEndHour: number;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultTheme: 'azure',
  supportedThemes: ['azure', 'meadow', 'magenta-dream'],
  themeStorageKey: 'seed-app.theme',
  autoColorModeStorageKey: 'seed-app.theme.autoColorMode',
  manualColorModeStorageKey: 'seed-app.theme.manualColorMode',
  fallbackLightStartHour: 6,
  fallbackLightEndHour: 20,
};
