import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private http = inject(HttpClient);
  readmeContent = signal<string>('Loading README...');

  constructor() {
    this.http
      .get('README.md', { responseType: 'text' })
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
