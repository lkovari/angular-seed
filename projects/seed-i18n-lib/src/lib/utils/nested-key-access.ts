import { type TranslationDictionary, type TranslationValue } from '../models/translation-dictionary';

export function getNestedTranslationValue(
  dictionary: TranslationDictionary,
  key: string,
): string | undefined {
  const segments = key.split('.');
  let current: TranslationValue | undefined = dictionary;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = current[segment];
  }

  return typeof current === 'string' ? current : undefined;
}
