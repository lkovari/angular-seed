import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  readmeContent = signal<string>('Loading README...');

  ngOnInit(): void {
    this.http.get('/README.md', { responseType: 'text' }).subscribe({
      next: (content) => this.readmeContent.set(content),
      error: () => this.readmeContent.set('Failed to load README.md')
    });
  }
}
