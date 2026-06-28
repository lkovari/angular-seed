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
import { MainLayoutComponent } from './core/shell/main-layout/main-layout.component';
import { ErrorNotificationService } from '../../../global-error-handler-lib/src/public-api';
import { LoadingSpinnerComponent } from '../../../seed-common-lib/src/public-api';
import {
  WaitSpinnerTestComponent,
  ComponentsTestsComponent,
  GenerateErrorsComponent,
} from './features/dev-tools';
import { SignupSigninComponent } from './features/auth';
import {
  LanguageSelectorComponent,
} from '../../../seed-i18n-lib/src/public-api';
import {
  ThemeSettingsComponent,
} from '../../../seed-theme-lib/src/public-api';

@Component({
  selector: 'app-root',
  imports: [
    MainLayoutComponent,
    GenerateErrorsComponent,
    LoadingSpinnerComponent,
    WaitSpinnerTestComponent,
    SignupSigninComponent,
    ComponentsTestsComponent,
    LanguageSelectorComponent,
    ThemeSettingsComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  private errorNotificationService = inject(ErrorNotificationService);

  waitSpinnerTest = viewChild(WaitSpinnerTestComponent);
  signupSignin = viewChild(SignupSigninComponent);
  componentsTests = viewChild(ComponentsTestsComponent);
  languageSelector = viewChild(LanguageSelectorComponent);
  themeSettings = viewChild(ThemeSettingsComponent);

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
    if (this.handleModShiftShortcut(event, 'e')) {
      this.toggleErrorModal();
      return;
    }

    if (this.handleModShiftShortcut(event, 'w')) {
      this.openWaitSpinnerTest();
      return;
    }

    if (this.handleModShiftShortcut(event, 'u')) {
      this.openSignUpModal();
      return;
    }

    if (this.handleModShiftShortcut(event, 'i')) {
      this.openSignInModal();
      return;
    }

    if (this.handleModShiftShortcut(event, 'l')) {
      this.openLanguageSelector();
      return;
    }

    if (this.handleModShiftShortcut(event, 's')) {
      this.openThemeSettings();
      return;
    }

    if (this.handleModShiftShortcut(event, 'c')) {
      this.openComponentsTests();
    }
  }

  private handleModShiftShortcut(event: KeyboardEvent, key: string): boolean {
    if (
      !(event.ctrlKey || event.metaKey) ||
      !event.shiftKey ||
      event.key.toLowerCase() !== key
    ) {
      return false;
    }
    event.preventDefault();
    return true;
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

  openLanguageSelector(): void {
    const component = this.languageSelector();
    if (component) {
      component.openModal();
    }
  }

  openThemeSettings(): void {
    const component = this.themeSettings();
    if (component) {
      component.openModal();
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
