import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ErrorNotificationService } from '../services/error-notification';
import { MockHttpService } from '../services/mock-http.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'lib-generate-errors',
  imports: [],
  templateUrl: './generate-errors.component.html',
  styleUrl: './generate-errors.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateErrorsComponent {
  private http = inject(HttpClient);
  private notificationService = inject(ErrorNotificationService);
  private mockHttp = inject(MockHttpService);
  private destroyRef = inject(DestroyRef);

  throwSimpleError(): void {
    throw new Error('This is a simple JavaScript error for testing');
  }

  throwTypeError(): void {
    const obj: unknown = null;
    // @ts-expect-error - Intentionally calling method on null for error testing
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    obj.someMethod();
  }

  throwReferenceError(): void {
    // @ts-expect-error - Intentionally accessing non-existent variable for error testing
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    nonExistentVariable.toString();
  }

  throwAsyncError(): void {
    void this.asyncErrorFunction();
  }

  private async asyncErrorFunction(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('This is an async error');
  }

  triggerHttp404(): void {
    this.http
      .get('/api/non-existent-endpoint')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('HTTP Error caught:', err);
        },
      });
  }

  triggerHttp500(): void {
    this.mockHttp
      .getErrorResponse(500, 'Internal Server Error')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('HTTP 500 Error caught:', err);
          this.notificationService.addErrorWithCallStack(
            'Internal server error. Please try again later.',
            err,
            'HttpError',
          );
        },
      });
  }

  triggerHttp401(): void {
    this.mockHttp
      .getErrorResponse(401, 'Unauthorized')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('HTTP 401 Error caught:', err);
          this.notificationService.addErrorWithCallStack(
            'You are not authorized. Please log in again.',
            err,
            'HttpError',
          );
        },
      });
  }

  triggerHttp402(): void {
    this.mockHttp
      .getErrorResponse(402, 'Payment Required')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('HTTP 402 Error caught:', err);
          this.notificationService.addErrorWithCallStack(
            'Payment required. Please complete payment to continue.',
            err,
            'HttpError',
          );
        },
      });
  }

  triggerHttp403(): void {
    this.mockHttp
      .getErrorResponse(403, 'Forbidden')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('HTTP 403 Error caught:', err);
          this.notificationService.addErrorWithCallStack(
            'You do not have permission to perform this action.',
            err,
            'HttpError',
          );
        },
      });
  }

  triggerNetworkError(): void {
    this.mockHttp
      .getNetworkError()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('Success');
        },
        error: (err) => {
          console.error('Network Error caught:', err);
          this.notificationService.addErrorWithCallStack(
            'Unable to connect to the server. Please check your internet connection.',
            err,
            'HttpError',
          );
        },
      });
  }

  throwPromiseError(): void {
    void Promise.reject(new Error('This is a rejected Promise error'));
  }

  throwTimeoutError(): void {
    setTimeout(() => {
      throw new Error('This is an error thrown in setTimeout');
    }, 100);
  }

  triggerCustomNotification(): void {
    this.notificationService.showError(
      'This is a custom error notification',
      5000,
    );
  }

  triggerWarningNotification(): void {
    this.notificationService.showWarning(
      'This is a warning notification',
      4000,
    );
  }

  triggerInfoNotification(): void {
    this.notificationService.showInfo('This is an info notification', 3000);
  }

  triggerSuccessNotification(): void {
    this.notificationService.showSuccess(
      'This is a success notification',
      3000,
    );
  }

  throwErrorWithCallStack(): void {
    try {
      this.deepNestedFunction();
    } catch (error) {
      this.notificationService.addErrorWithCallStack(
        'Error with call stack captured',
        error,
        'CustomError',
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
