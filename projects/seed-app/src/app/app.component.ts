import {
  Component,
  HostListener,
  signal,
  ChangeDetectionStrategy,
  inject,
  effect,
  viewChild,
  computed,
  type OnDestroy,
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
  ComponentsTestsComponent,
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
    ComponentsTestsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  private errorNotificationService = inject(ErrorNotificationService);
  private loadingService = inject(LoadingIndicatorService);

  waitSpinnerTest = viewChild(WaitSpinnerTestComponent);
  signupSignin = viewChild(SignupSigninComponent);
  componentsTests = viewChild(ComponentsTestsComponent);

  title = 'seed-app';
  showErrorModal = signal(false);
  showErrorHistoryModal = signal(false);
  showErrorIndicator = signal(false);
  errorHistory = this.errorNotificationService.errorHistorySignal;

  private indicatorTimeout: ReturnType<typeof setTimeout> | undefined;

  readonly formattedErrorHistory = computed(() => {
    return this.errorHistory().map((error) => ({
      ...error,
      formattedTimestamp: new Date(error.timestamp).toLocaleString(),
      statusText: this.getStatusText(error.httpStatus ?? 0),
      formattedContext: error.errorContext
        ? this.formatContext(error.errorContext)
        : '',
    }));
  });

  constructor() {
    effect(() => {
      const errors = this.errorHistory();
      if (errors.length > 0) {
        this.showIndicatorTemporarily();
      }
    });
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

    // Check for Ctrl+Shift+C (Control key on Mac, not Cmd) - C for Components Tests
    if (
      event.ctrlKey &&
      !event.metaKey &&
      event.shiftKey &&
      (event.key.toLowerCase() === 'c' || event.code === 'KeyC')
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.openComponentsTests();
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

  openComponentsTests(): void {
    const component = this.componentsTests();
    if (component) {
      component.openModal();
    } else {
      console.warn('ComponentsTestsComponent not found');
    }
  }

  toggleErrorModal(): void {
    this.showErrorModal.update((value) => !value);
  }

  closeErrorModal(): void {
    this.showErrorModal.set(false);
  }

  showIndicatorTemporarily(): void {
    if (this.indicatorTimeout) {
      clearTimeout(this.indicatorTimeout);
    }

    this.showErrorIndicator.set(true);

    this.indicatorTimeout = setTimeout(() => {
      this.showErrorIndicator.set(false);
    }, 10000);
  }

  openErrorHistoryModal(): void {
    this.showErrorHistoryModal.set(true);
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
    this.showErrorHistoryModal.set(false);
  }

  ngOnDestroy(): void {
    if (this.indicatorTimeout) {
      clearTimeout(this.indicatorTimeout);
    }
  }

  private formatTimestamp(date: Date): string {
    return new Date(date).toLocaleString();
  }

  private getStatusText(status: number): string {
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

  private formatContext(context: Record<string, unknown>): string {
    const cleanContext = {
      url: context['url'],
      userAgent: context['userAgent'],
      errorType: context['errorType'],
    };
    return JSON.stringify(cleanContext, null, 2);
  }
}
