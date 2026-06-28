import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    const translations = signal<Record<string, unknown>>({
      navigation: { home: 'Home' },
    });
    const activeLocale = signal<'en' | 'hu' | 'de'>('en');
    const localeRevision = signal(0);

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        {
          provide: TranslationService,
          useValue: {
            activeLocale,
            translations,
            localeRevision,
            translate: (key: string) => {
              activeLocale();
              translations();
              localeRevision();
              if (key === 'navigation.home') {
                return 'Home';
              }
              return key;
            },
          },
        },
      ],
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should translate keys', () => {
    expect(pipe.transform('navigation.home')).toBe('Home');
  });

  it('should return key when translation is missing', () => {
    expect(pipe.transform('missing.key')).toBe('missing.key');
  });
});
