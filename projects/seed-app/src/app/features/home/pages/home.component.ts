import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomeApiService } from '../data/home-api.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private homeApi = inject(HomeApiService);
  readmeContent = signal<string>('Loading README...');

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
          this.readmeContent.set('Failed to load README.md');
        },
      });
  }
}
