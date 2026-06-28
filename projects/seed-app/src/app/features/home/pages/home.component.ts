import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TranslatePipe,
  TranslationService,
} from '../../../../../../seed-i18n-lib/src/public-api';
import { HomeApiService } from '../data/home-api.service';

@Component({
  selector: 'app-home',
  imports: [TranslatePipe],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private homeApi = inject(HomeApiService);
  private translationService = inject(TranslationService);
  readmeContent = signal<string>(
    this.translationService.translate('features.home.loadingReadme'),
  );

  constructor() {
    this.homeApi
      .getReadmeContent()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (content) => {
          this.readmeContent.set(content);
        },
        error: (err) => {
          console.error('Failed to load README.md:', err);
          this.readmeContent.set(
            this.translationService.translate('features.home.readmeLoadFailed'),
          );
        },
      });
  }
}
