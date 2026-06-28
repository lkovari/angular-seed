import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ColorScheduleService } from './color-schedule.service';
import { provideThemeTesting } from '../testing/provide-theme-testing';

describe('ColorScheduleService', () => {
  let service: ColorScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...provideThemeTesting()],
    });
    service = TestBed.inject(ColorScheduleService);
  });

  afterEach(() => {
    service.stopWatcher();
    vi.restoreAllMocks();
  });

  it('should return light during fallback daylight hours for unknown timezone', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'Unknown/Timezone' }),
    } as Intl.DateTimeFormat);

    const noon = new Date(2026, 5, 28, 12, 0, 0);
    expect(service.computeColorMode(noon)).toBe('light');
  });

  it('should return dark during fallback night hours for unknown timezone', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'Unknown/Timezone' }),
    } as Intl.DateTimeFormat);

    const midnight = new Date(2026, 5, 28, 23, 0, 0);
    expect(service.computeColorMode(midnight)).toBe('dark');
  });

  it('should compute mode from sunrise and sunset for known timezone', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockReturnValue({
      resolvedOptions: () => ({ timeZone: 'Europe/Budapest' }),
    } as Intl.DateTimeFormat);

    const noon = new Date(2026, 5, 28, 12, 0, 0);
    expect(service.computeColorMode(noon)).toBe('light');

    const lateNight = new Date(2026, 5, 28, 2, 0, 0);
    expect(service.computeColorMode(lateNight)).toBe('dark');
  });

  it('should update scheduledColorMode signal when refreshed', () => {
    service.refreshScheduledMode();
    expect(['light', 'dark']).toContain(service.scheduledColorMode());
  });
});
