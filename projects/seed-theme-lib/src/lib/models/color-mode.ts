export const COLOR_MODES = ['light', 'dark'] as const;

export type ColorMode = (typeof COLOR_MODES)[number];

export function isColorMode(value: string): value is ColorMode {
  return COLOR_MODES.some((mode) => mode === value);
}
