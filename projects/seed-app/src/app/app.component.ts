import {
  Component,
  HostListener,
  signal,
  ChangeDetectionStrategy,
  inject,
  effect,
  viewChild,
} from '@angular/core';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import {
  GenerateErrorsComponent,
  ErrorNotificationService,
} from '../../../global-error-handler-lib/src/public-api';
import {
  LoadingSpinnerComponent,
  LoadingIndicatorService,
  WaitSpinnerTestComponent,
  SignupSigninComponent,
} from '../../../seed-common-lib/src/public-api';
// import { CustomLoadingAdapter } from './shared/adapters/custom-loading';

@Component({
  selector: 'app-root',
  imports: [
    MainLayoutComponent,
    GenerateErrorsComponent,
    LoadingSpinnerComponent,
    WaitSpinnerTestComponent,
    SignupSigninComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private errorNotificationService = inject(ErrorNotificationService);
  private loadingService = inject(LoadingIndicatorService);

  // ViewChild for wait spinner test component
  waitSpinnerTest = viewChild(WaitSpinnerTestComponent);
  signupSignin = viewChild(SignupSigninComponent);

  title = 'seed-app';
  showErrorModal = signal(false);
  showErrorHistoryModal = signal(false);
  showErrorIndicator = signal(false);
  errorHistory = this.errorNotificationService.errorHistorySignal;

  private indicatorTimeout: ReturnType<typeof setTimeout> | undefined;

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
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === 'e'
    ) {
      event.preventDefault();
      this.toggleErrorModal();
    }

    // Check for Ctrl+Shift+W (or Cmd+Shift+W on Mac) - W for Wait Spinner
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLowerCase() === 'w'
    ) {
      event.preventDefault();
      this.openWaitSpinnerTest();
    }

    // Check for Ctrl+Shift+U (Control key on Mac, not Cmd) - U for Sign Up
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'u') {
      event.preventDefault();
      this.openSignUpModal();
    }

    // Check for Ctrl+Shift+I (Control key on Mac, not Cmd) - I for Sign In
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this.openSignInModal();
    }
  }

  openWaitSpinnerTest(): void {
    const testComponent = this.waitSpinnerTest();
    if (testComponent) {
      testComponent.openModal();
    }
  }

  openSignUpModal(): void {
    const component = this.signupSignin();
    if (component) {
      component.openSignUpModal();
    }
  }

  openSignInModal(): void {
    const component = this.signupSignin();
    if (component) {
      component.openSignInModal();
    }
  }

  toggleErrorModal(): void {
    this.showErrorModal.update((value) => !value);
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
      504: 'Gateway Timeout',
    };
    return statusTexts[status] ?? '';
  }

  formatContext(context: Record<string, unknown>): string {
    // Create a clean copy without the originalError (too verbose)
    const cleanContext = {
      url: context['url'],
      userAgent: context['userAgent'],
      errorType: context['errorType'],
    };
    return JSON.stringify(cleanContext, null, 2);
  }
}
