import {
  Injectable,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { type ColorMode, isColorMode } from '../models/color-mode';
import { type ThemeId, isThemeId } from '../models/theme-id';
import { THEME_CONFIG } from '../models/theme-config.token';
import { ColorScheduleService } from './color-schedule.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly config = inject(THEME_CONFIG);
  private readonly scheduleService = inject(ColorScheduleService);

  readonly activeTheme = signal<ThemeId>(this.config.defaultTheme);
  readonly autoColorMode = signal(true);
  readonly manualColorMode = signal<ColorMode>('light');

  readonly effectiveColorMode = computed<ColorMode>(() =>
    this.autoColorMode()
      ? this.scheduleService.scheduledColorMode()
      : this.manualColorMode(),
  );

  constructor() {
    effect(() => {
      const theme = this.activeTheme();
      const colorMode = this.effectiveColorMode();
      document.documentElement.dataset['theme'] = theme;
      document.documentElement.dataset['colorMode'] = colorMode;
    });

    effect(() => {
      if (this.autoColorMode()) {
        this.scheduleService.startWatcher();
      } else {
        this.scheduleService.stopWatcher();
      }
    });
  }

  initialize(): void {
    const storedTheme = this.readStoredTheme();
    const storedAuto = this.readStoredAutoColorMode();
    const storedManual = this.readStoredManualColorMode();

    if (storedTheme) {
      this.activeTheme.set(storedTheme);
    }

    if (storedAuto !== undefined) {
      this.autoColorMode.set(storedAuto);
    }

    if (storedManual) {
      this.manualColorMode.set(storedManual);
    }

    if (this.autoColorMode()) {
      this.scheduleService.startWatcher();
    } else {
      this.scheduleService.refreshScheduledMode();
    }

    document.documentElement.dataset['theme'] = this.activeTheme();
    document.documentElement.dataset['colorMode'] = this.effectiveColorMode();
  }

  setTheme(theme: ThemeId): void {
    if (!this.config.supportedThemes.includes(theme)) {
      return;
    }
    this.activeTheme.set(theme);
    this.persistTheme(theme);
  }

  setAutoColorMode(enabled: boolean): void {
    this.autoColorMode.set(enabled);
    this.persistAutoColorMode(enabled);
  }

  setManualColorMode(mode: ColorMode): void {
    this.manualColorMode.set(mode);
    this.persistManualColorMode(mode);
  }

  applySettings(settings: {
    theme: ThemeId;
    autoColorMode: boolean;
    manualColorMode: ColorMode;
  }): void {
    this.activeTheme.set(settings.theme);
    this.autoColorMode.set(settings.autoColorMode);
    this.manualColorMode.set(settings.manualColorMode);
    this.persistTheme(settings.theme);
    this.persistAutoColorMode(settings.autoColorMode);
    this.persistManualColorMode(settings.manualColorMode);
  }

  private readStoredTheme(): ThemeId | undefined {
    try {
      const value = localStorage.getItem(this.config.themeStorageKey);
      const normalized = value === 'blossom' ? 'azure' : value;
      if (
        normalized &&
        isThemeId(normalized) &&
        this.config.supportedThemes.includes(normalized)
      ) {
        return normalized;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private readStoredAutoColorMode(): boolean | undefined {
    try {
      const value = localStorage.getItem(this.config.autoColorModeStorageKey);
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private readStoredManualColorMode(): ColorMode | undefined {
    try {
      const value = localStorage.getItem(this.config.manualColorModeStorageKey);
      if (value && isColorMode(value)) {
        return value;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }

  private persistTheme(theme: ThemeId): void {
    try {
      localStorage.setItem(this.config.themeStorageKey, theme);
    } catch {
      return;
    }
  }

  private persistAutoColorMode(enabled: boolean): void {
    try {
      localStorage.setItem(
        this.config.autoColorModeStorageKey,
        String(enabled),
      );
    } catch {
      return;
    }
  }

  private persistManualColorMode(mode: ColorMode): void {
    try {
      localStorage.setItem(this.config.manualColorModeStorageKey, mode);
    } catch {
      return;
    }
  }
}
