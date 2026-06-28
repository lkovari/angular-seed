import { inject, type Provider } from '@angular/core';
import { TranslationService } from '../../../../../seed-i18n-lib/src/public-api';
import { THEME_TRANSLATE } from '../../../../../seed-theme-lib/src/public-api';

export function provideThemeTranslate(): Provider {
  return {
    provide: THEME_TRANSLATE,
    useFactory: () => {
      const translationService = inject(TranslationService);
      return (key: string) => translationService.translate(key);
    },
  };
}
