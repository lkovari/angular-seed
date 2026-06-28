import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { I18N_CONFIG } from '../models/i18n-config.token';
import {
  isSupportedLocale,
  type SupportedLocale,
} from '../models/supported-locale';
import { type TranslationDictionary } from '../models/translation-dictionary';
import { getNestedTranslationValue } from '../utils/nested-key-access';
import { interpolate } from '../utils/interpolate';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(I18N_CONFIG);
  private readonly localeCache = new Map<SupportedLocale, TranslationDictionary>();
  private fallbackDictionary: TranslationDictionary = {};

  readonly activeLocale = signal<SupportedLocale>(this.config.defaultLocale);
  readonly translations = signal<TranslationDictionary>({});
  readonly localeRevision = signal(0);
  readonly isLoaded = signal(false);

  async initialize(): Promise<void> {
    const storedLocale = this.readStoredLocale();
    const initialLocale = storedLocale ?? this.config.defaultLocale;

    await this.loadLocale(this.config.fallbackLocale);
    this.fallbackDictionary =
      this.localeCache.get(this.config.fallbackLocale) ?? {};

    if (initialLocale !== this.config.fallbackLocale) {
      await this.loadLocale(initialLocale);
    }

    this.applyActiveLocale(initialLocale);
    this.isLoaded.set(true);
  }

  async setLocale(locale: SupportedLocale): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      return;
    }

    await this.loadLocale(locale);
    this.applyActiveLocale(locale);
    this.persistLocale(locale);
  }

  translate(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    const activeDictionary = this.translations();
    const activeValue = getNestedTranslationValue(activeDictionary, key);

    if (activeValue !== undefined) {
      return interpolate(activeValue, params);
    }

    const fallbackValue = getNestedTranslationValue(
      this.fallbackDictionary,
      key,
    );

    if (fallbackValue !== undefined) {
      return interpolate(fallbackValue, params);
    }

    if (!this.config.production) {
      console.warn(`[i18n] Missing translation key: "${key}"`);
    }

    return key;
  }

  private async loadLocale(locale: SupportedLocale): Promise<void> {
    if (this.localeCache.has(locale)) {
      return;
    }

    const url = `${this.config.assetsPath}/${locale}.json`;
    const dictionary = await firstValueFrom(
      this.http.get<TranslationDictionary>(url),
    );
    this.localeCache.set(locale, dictionary);
  }

  private applyActiveLocale(locale: SupportedLocale): void {
    const dictionary = this.localeCache.get(locale) ?? {};
    this.activeLocale.set(locale);
    this.translations.set(structuredClone(dictionary));
    this.localeRevision.update((revision) => revision + 1);
  }

  private readStoredLocale(): SupportedLocale | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(this.config.storageKey);
    if (stored && isSupportedLocale(stored)) {
      return stored;
    }

    return null;
  }

  private persistLocale(locale: SupportedLocale): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.config.storageKey, locale);
  }
}
