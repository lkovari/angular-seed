import { describe, it, expect } from 'vitest';
import { getNestedTranslationValue } from './nested-key-access';

describe('getNestedTranslationValue', () => {
  const dictionary = {
    navigation: {
      home: 'Home',
    },
    languageSelector: {
      locales: {
        en: 'English',
      },
    },
  };

  it('should resolve nested keys', () => {
    expect(getNestedTranslationValue(dictionary, 'navigation.home')).toBe('Home');
  });

  it('should resolve deeply nested keys', () => {
    expect(getNestedTranslationValue(dictionary, 'languageSelector.locales.en')).toBe(
      'English',
    );
  });

  it('should return undefined for missing keys', () => {
    expect(getNestedTranslationValue(dictionary, 'missing.key')).toBeUndefined();
  });
});
