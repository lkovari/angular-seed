import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeApiService {
  private http = inject(HttpClient);

  getReadmeContent(): Observable<string> {
    return this.http.get('README.md', { responseType: 'text' });
  }
}
