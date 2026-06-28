import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { THEME_TRANSLATE } from '../../models/theme-translate.token';
import { THEME_IDS, isThemeId, type ThemeId } from '../../models/theme-id';
import { type ColorMode } from '../../models/color-mode';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'lib-theme-settings',
  templateUrl: './theme-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSettingsComponent {
  private readonly themeService = inject(ThemeService);
  private readonly translateFn = inject(THEME_TRANSLATE);

  readonly showModal = signal(false);
  readonly supportedThemes = THEME_IDS;

  readonly draftTheme = signal<ThemeId>('azure');
  readonly draftAutoColorMode = signal(true);
  readonly draftManualColorMode = signal<ColorMode>('light');

  openModal(): void {
    this.draftTheme.set(this.themeService.activeTheme());
    this.draftAutoColorMode.set(this.themeService.autoColorMode());
    this.draftManualColorMode.set(this.themeService.manualColorMode());
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onThemeChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }
    const value = target.value;
    if (isThemeId(value)) {
      this.draftTheme.set(value);
    }
  }

  onAutoColorModeChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.draftAutoColorMode.set(target.checked);
    }
  }

  selectManualColorMode(mode: ColorMode): void {
    this.draftManualColorMode.set(mode);
  }

  applySettings(): void {
    this.themeService.applySettings({
      theme: this.draftTheme(),
      autoColorMode: this.draftAutoColorMode(),
      manualColorMode: this.draftManualColorMode(),
    });
    this.closeModal();
  }

  translate(key: string): string {
    return this.translateFn(key);
  }

  themeLabelKey(theme: ThemeId): string {
    return `themeSettings.themes.${theme}`;
  }
}
