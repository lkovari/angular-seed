import { Component, inject, signal, type OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  readmeContent = signal<string>('Loading README...');

  ngOnInit(): void {
    // Use relative path that works with base href
    this.http.get('README.md', { responseType: 'text' }).subscribe({
      next: (content) => this.readmeContent.set(content),
      error: (err) => {
        console.error('Failed to load README.md:', err);
        this.readmeContent.set('Failed to load README.md');
      },
    });
  }
}
