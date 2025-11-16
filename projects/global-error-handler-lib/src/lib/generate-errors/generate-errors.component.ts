import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorNotificationService } from '../services/error-notification';

@Component({
  selector: 'lib-generate-errors',
  imports: [],
  templateUrl: './generate-errors.component.html',
  styleUrl: './generate-errors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateErrorsComponent {
  private http = inject(HttpClient);
  private notificationService = inject(ErrorNotificationService);

  throwSimpleError(): void {
    throw new Error('This is a simple JavaScript error for testing');
  }

  throwTypeError(): void {
    const obj: any = null;
    obj.someMethod();
  }

  throwReferenceError(): void {
    // @ts-ignore
    nonExistentVariable.toString();
  }

  throwAsyncError(): void {
    this.asyncErrorFunction();
  }

  private async asyncErrorFunction(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('This is an async error');
  }

  triggerHttp404(): void {
    this.http.get('/api/non-existent-endpoint').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('HTTP Error caught:', err)
    });
  }

  triggerHttp500(): void {
    this.http.get('https://httpbin.org/status/500').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('HTTP 500 Error caught:', err)
    });
  }

  triggerHttp401(): void {
    this.http.get('https://httpbin.org/status/401').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('HTTP 401 Error caught:', err)
    });
  }

  triggerHttp402(): void {
    this.http.get('https://httpbin.org/status/402').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('HTTP 402 Error caught:', err)
    });
  }

  triggerHttp403(): void {
    this.http.get('https://httpbin.org/status/403').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('HTTP 403 Error caught:', err)
    });
  }

  triggerNetworkError(): void {
    this.http.get('https://invalid-domain-that-does-not-exist-12345.com/api').subscribe({
      next: () => console.log('Success'),
      error: (err) => console.error('Network Error caught:', err)
    });
  }

  throwPromiseError(): void {
    Promise.reject(new Error('This is a rejected Promise error'));
  }

  throwTimeoutError(): void {
    setTimeout(() => {
      throw new Error('This is an error thrown in setTimeout');
    }, 100);
  }

  triggerCustomNotification(): void {
    this.notificationService.showError('This is a custom error notification', 5000);
  }

  triggerWarningNotification(): void {
    this.notificationService.showWarning('This is a warning notification', 4000);
  }

  triggerInfoNotification(): void {
    this.notificationService.showInfo('This is an info notification', 3000);
  }

  triggerSuccessNotification(): void {
    this.notificationService.showSuccess('This is a success notification', 3000);
  }

  throwErrorWithCallStack(): void {
    try {
      this.deepNestedFunction();
    } catch (error) {
      this.notificationService.addErrorWithCallStack(
        'Error with call stack captured',
        error,
        'CustomError'
      );
    }
  }

  private deepNestedFunction(): void {
    this.anotherNestedFunction();
  }

  private anotherNestedFunction(): void {
    throw new Error('Deep nested error for call stack testing');
  }
}
