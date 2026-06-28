import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { ColorScheduleService } from './color-schedule.service';
import { provideThemeTesting } from '../testing/provide-theme-testing';
import { DEFAULT_THEME_CONFIG } from '../models/theme-config';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-mode');

    TestBed.configureTestingModule({
      providers: [...provideThemeTesting(), ThemeService, ColorScheduleService],
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.inject(ColorScheduleService).stopWatcher();
  });

  it('should initialize with default theme', () => {
    service.initialize();
    expect(service.activeTheme()).toBe('azure');
    expect(document.documentElement.dataset['theme']).toBe('azure');
  });

  it('should restore theme from localStorage', () => {
    localStorage.setItem(DEFAULT_THEME_CONFIG.themeStorageKey, 'meadow');
    localStorage.setItem(
      DEFAULT_THEME_CONFIG.autoColorModeStorageKey,
      'false',
    );
    localStorage.setItem(
      DEFAULT_THEME_CONFIG.manualColorModeStorageKey,
      'dark',
    );

    service.initialize();

    expect(service.activeTheme()).toBe('meadow');
    expect(service.autoColorMode()).toBe(false);
    expect(service.manualColorMode()).toBe('dark');
    expect(service.effectiveColorMode()).toBe('dark');
  });

  it('should migrate stored blossom theme to azure', () => {
    localStorage.setItem(DEFAULT_THEME_CONFIG.themeStorageKey, 'blossom');

    service.initialize();

    expect(service.activeTheme()).toBe('azure');
  });

  it('should persist settings on apply', () => {
    service.initialize();
    service.applySettings({
      theme: 'magenta-dream',
      autoColorMode: false,
      manualColorMode: 'light',
    });
    TestBed.flushEffects();

    expect(localStorage.getItem(DEFAULT_THEME_CONFIG.themeStorageKey)).toBe(
      'magenta-dream',
    );
    expect(
      localStorage.getItem(DEFAULT_THEME_CONFIG.autoColorModeStorageKey),
    ).toBe('false');
    expect(
      localStorage.getItem(DEFAULT_THEME_CONFIG.manualColorModeStorageKey),
    ).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('magenta-dream');
    expect(document.documentElement.dataset['colorMode']).toBe('light');
  });

  it('should use scheduled mode when auto is enabled', () => {
    service.initialize();
    service.setAutoColorMode(true);
    const scheduleService = TestBed.inject(ColorScheduleService);
    scheduleService.scheduledColorMode.set('dark');
    expect(service.effectiveColorMode()).toBe('dark');
  });
});
