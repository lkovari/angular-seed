import { Injectable } from '@angular/core';
import { type Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MockHttpService {
  /**
   * Simulates an HTTP error response with the specified status code
   * @param status HTTP status code (e.g., 401, 403, 404, 500)
   * @param statusText HTTP status text (e.g., 'Unauthorized', 'Internal Server Error')
   * @returns Observable that immediately errors with HttpErrorResponse
   */
  getErrorResponse(status: number, statusText: string): Observable<never> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status,
          statusText,
          error: { message: statusText },
        }),
    );
  }

  /**
   * Simulates a network error (connection failure, DNS error, etc.)
   * @returns Observable that immediately errors with HttpErrorResponse (status 0)
   */
  getNetworkError(): Observable<never> {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 0,
          statusText: 'Unknown Error',
          error: new ProgressEvent('error'),
          url: 'https://invalid-domain-that-does-not-exist-12345.com/api',
        }),
    );
  }
}

