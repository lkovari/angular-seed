import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslationService } from './translation.service';
import { I18N_CONFIG } from '../models/i18n-config.token';
import { DEFAULT_I18N_CONFIG } from '../models/i18n-config';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: I18N_CONFIG,
          useValue: {
            ...DEFAULT_I18N_CONFIG,
            assetsPath: '/assets/i18n',
          },
        },
      ],
    });

    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  function flushLocale(locale: string, dictionary: Record<string, unknown>): void {
    const request = httpMock.expectOne(`/assets/i18n/${locale}.json`);
    request.flush(dictionary);
  }

  it('should load default locale on initialize', async () => {
    const initPromise = service.initialize();
    flushLocale('en', {
      navigation: { home: 'Home' },
    });
    await initPromise;

    expect(service.activeLocale()).toBe('en');
    expect(service.translate('navigation.home')).toBe('Home');
    expect(service.isLoaded()).toBe(true);
  });

  it('should fallback to English for missing keys', async () => {
    const initPromise = service.initialize();
    flushLocale('en', {
      navigation: { home: 'Home' },
    });
    await initPromise;

    const setLocalePromise = service.setLocale('hu');
    flushLocale('hu', {
      navigation: { home: 'Kezdőlap' },
    });
    await setLocalePromise;

    expect(service.translate('navigation.home')).toBe('Kezdőlap');
    expect(service.translate('missing.key')).toBe('missing.key');
  });

  it('should persist selected locale', async () => {
    const initPromise = service.initialize();
    flushLocale('en', { navigation: { home: 'Home' } });
    await initPromise;

    const setLocalePromise = service.setLocale('de');
    flushLocale('de', { navigation: { home: 'Startseite' } });
    await setLocalePromise;

    expect(localStorage.getItem('seed-app.locale')).toBe('de');
  });

  it('should interpolate params', async () => {
    const initPromise = service.initialize();
    flushLocale('en', {
      greeting: 'Hello, {{name}}',
    });
    await initPromise;

    expect(service.translate('greeting', { name: 'Ada' })).toBe('Hello, Ada');
  });

  it('should switch back to English after another locale', async () => {
    const initPromise = service.initialize();
    flushLocale('en', {
      navigation: { home: 'Home' },
    });
    await initPromise;

    const huPromise = service.setLocale('hu');
    flushLocale('hu', {
      navigation: { home: 'Kezdőlap' },
    });
    await huPromise;
    expect(service.translate('navigation.home')).toBe('Kezdőlap');

    await service.setLocale('en');
    expect(service.activeLocale()).toBe('en');
    expect(service.translate('navigation.home')).toBe('Home');
  });
});
