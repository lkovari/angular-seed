import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '../../models/supported-locale';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'lib-language-selector',
  imports: [TranslatePipe],
  templateUrl: './language-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelectorComponent {
  private readonly translationService = inject(TranslationService);

  readonly localeSelect = viewChild<ElementRef<HTMLSelectElement>>('localeSelect');
  readonly showModal = signal(false);
  readonly supportedLocales = SUPPORTED_LOCALES;
  readonly selectedLocale = signal<SupportedLocale>('en');
  readonly isApplying = signal(false);

  openModal(): void {
    this.selectedLocale.set(this.translationService.activeLocale());
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onLocaleChange(event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }

    const value = select.value;
    if (value === 'en' || value === 'hu' || value === 'de') {
      this.selectedLocale.set(value);
    }
  }

  async applyLocale(): Promise<void> {
    if (this.isApplying()) {
      return;
    }

    const select = this.localeSelect()?.nativeElement;
    if (select) {
      const value = select.value;
      if (value === 'en' || value === 'hu' || value === 'de') {
        this.selectedLocale.set(value);
      }
    }

    this.isApplying.set(true);
    try {
      await this.translationService.setLocale(this.selectedLocale());
      this.closeModal();
    } finally {
      this.isApplying.set(false);
    }
  }

  localeLabelKey(locale: SupportedLocale): string {
    return `languageSelector.locales.${locale}`;
  }
}
