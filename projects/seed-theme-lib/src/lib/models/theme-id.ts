export const THEME_IDS = ['azure', 'meadow', 'magenta-dream'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.some((id) => id === value);
}
