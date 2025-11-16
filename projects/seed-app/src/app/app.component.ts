import { Component, HostListener, signal, ChangeDetectionStrategy, inject, effect, viewChild } from '@angular/core';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { GenerateErrorsComponent, ErrorNotificationService, ErrorNotification } from 'global-error-handler-lib';
import { LoadingSpinnerComponent, LoadingIndicatorService, WaitSpinnerTestComponent } from 'seed-common-lib';
// import { CustomLoadingAdapter } from './shared/adapters/custom-loading';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent, GenerateErrorsComponent, LoadingSpinnerComponent, WaitSpinnerTestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private errorNotificationService = inject(ErrorNotificationService);
  private loadingService = inject(LoadingIndicatorService);
  
  // ViewChild for wait spinner test component
  waitSpinnerTest = viewChild(WaitSpinnerTestComponent);
  
  title = 'seed-app';
  showErrorModal = signal(false);
  showErrorHistoryModal = signal(false);
  showErrorIndicator = signal(false);
  errorHistory = this.errorNotificationService.errorHistorySignal;
  
  private indicatorTimeout: any;

  constructor() {
    // Watch for new errors in history
    effect(() => {
      const errors = this.errorHistory();
      if (errors.length > 0) {
        this.showIndicatorTemporarily();
      }
    });

    // Optional: Set custom loading adapter
    // this.loadingService.setAdapter(new CustomLoadingAdapter());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Check for Ctrl+Shift+E (or Cmd+Shift+E on Mac) - E for Errors
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      this.toggleErrorModal();
    }
    
    // Check for Ctrl+Shift+W (or Cmd+Shift+W on Mac) - W for Wait Spinner
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'w') {
      event.preventDefault();
      this.openWaitSpinnerTest();
    }
  }

  openWaitSpinnerTest(): void {
    const testComponent = this.waitSpinnerTest();
    if (testComponent) {
      testComponent.openModal();
    }
  }

  toggleErrorModal(): void {
    this.showErrorModal.update(value => !value);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  showIndicatorTemporarily(): void {
    // Clear any existing timeout
    if (this.indicatorTimeout) {
      clearTimeout(this.indicatorTimeout);
    }

    // Show indicator
    this.showErrorIndicator.set(true);

    // Hide after 10 seconds
    this.indicatorTimeout = setTimeout(() => {
      this.showErrorIndicator.set(false);
    }, 10000);
  }

  openErrorHistoryModal(): void {
    this.showErrorHistoryModal.set(true);
    // Keep indicator visible when modal is open
    if (this.indicatorTimeout) {
      clearTimeout(this.indicatorTimeout);
    }
  }

  closeErrorHistoryModal(): void {
    this.showErrorHistoryModal.set(false);
  }

  clearErrorHistory(): void {
    this.errorNotificationService.clearErrorHistory();
    this.showErrorIndicator.set(false);
    // Don't close the modal, let user close it with X button
  }

  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      402: 'Payment Required',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return statusTexts[status] || '';
  }

  formatContext(context: any): string {
    // Create a clean copy without the originalError (too verbose)
    const cleanContext = {
      url: context.url,
      userAgent: context.userAgent,
      errorType: context.errorType
    };
    return JSON.stringify(cleanContext, null, 2);
  }
}
