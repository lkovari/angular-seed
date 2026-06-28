import { Injectable, inject, signal } from '@angular/core';
import { getTimes } from 'suncalc';
import { type ColorMode } from '../models/color-mode';
import { THEME_CONFIG } from '../models/theme-config.token';
import { resolveCoordinatesForTimezone } from '../utils/timezone-coordinates';

@Injectable({ providedIn: 'root' })
export class ColorScheduleService {
  private readonly config = inject(THEME_CONFIG);

  readonly scheduledColorMode = signal<ColorMode>('light');

  private pollIntervalId: ReturnType<typeof setInterval> | undefined;
  private visibilityHandler: (() => void) | undefined;

  computeColorMode(at: Date = new Date()): ColorMode {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const coordinates = resolveCoordinatesForTimezone(timeZone);

    if (!coordinates) {
      return this.fallbackColorMode(at);
    }

    const times = getTimes(at, coordinates.latitude, coordinates.longitude);
    const sunrise = times.sunrise;
    const sunset = times.sunset;

    if (
      !sunrise ||
      !sunset ||
      Number.isNaN(sunrise.getTime()) ||
      Number.isNaN(sunset.getTime())
    ) {
      return this.fallbackColorMode(at);
    }

    return at >= sunrise && at < sunset ? 'light' : 'dark';
  }

  refreshScheduledMode(): void {
    this.scheduledColorMode.set(this.computeColorMode());
  }

  startWatcher(): void {
    this.stopWatcher();
    this.refreshScheduledMode();

    this.pollIntervalId = setInterval(() => {
      this.refreshScheduledMode();
    }, 60_000);

    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.refreshScheduledMode();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  stopWatcher(): void {
    if (this.pollIntervalId !== undefined) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = undefined;
    }

    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = undefined;
    }
  }

  private fallbackColorMode(at: Date): ColorMode {
    const hour = at.getHours();
    return hour >= this.config.fallbackLightStartHour &&
      hour < this.config.fallbackLightEndHour
      ? 'light'
      : 'dark';
  }
}
