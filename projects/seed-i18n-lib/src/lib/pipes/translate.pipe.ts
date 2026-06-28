import { Pipe, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe {
  private readonly translationService = inject(TranslationService);

  transform(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    this.translationService.activeLocale();
    this.translationService.translations();
    this.translationService.localeRevision();
    return this.translationService.translate(key, params);
  }
}
