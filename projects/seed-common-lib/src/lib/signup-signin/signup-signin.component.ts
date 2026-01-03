import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  type OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Field,
  form,
  required,
  email,
  minLength,
} from '@angular/forms/signals';

@Component({
  selector: 'lib-signup-signin',
  imports: [CommonModule, Field],
  templateUrl: './signup-signin.component.html',
  styleUrl: './signup-signin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupSigninComponent implements OnDestroy {
  readonly githubLogoPath = input<string>('');

  readonly signUp = output<{ email: string; password: string }>();
  readonly signIn = output<{ email: string; password: string }>();

  readonly signUpModel = signal({
    email: '',
    password: '',
    confirmPassword: '',
  });

  readonly signUpForm = form(this.signUpModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required' });
    email(fieldPath.email, { message: 'Enter a valid email address' });
    required(fieldPath.password, { message: 'Password is required' });
    minLength(fieldPath.password, 5, {
      message: 'Password must be at least 5 characters',
    });
    required(fieldPath.confirmPassword, {
      message: 'Confirm password is required',
    });
    minLength(fieldPath.confirmPassword, 5, {
      message: 'Confirm password must be at least 5 characters',
    });
  });

  readonly passwordsMatch = computed(() => {
    const model = this.signUpModel();
    return model.password === model.confirmPassword;
  });

  readonly signInModel = signal({
    email: '',
    password: '',
  });

  readonly signInForm = form(this.signInModel, (fieldPath) => {
    required(fieldPath.email, { message: 'Email is required' });
    email(fieldPath.email, { message: 'Enter a valid email address' });
    required(fieldPath.password, { message: 'Password is required' });
    minLength(fieldPath.password, 5, {
      message: 'Password must be at least 5 characters',
    });
  });

  readonly showSignUpModal = signal<boolean>(false);
  readonly showSignInModal = signal<boolean>(false);

  readonly submittedSignUpData = signal<{
    email: string;
    password: string;
    confirmPassword: string;
  } | null>(null);
  readonly submittedSignInData = signal<{
    email: string;
    password: string;
  } | null>(null);

  private signUpTimeout: ReturnType<typeof setTimeout> | undefined;
  private signInTimeout: ReturnType<typeof setTimeout> | undefined;

  submitSignUp(): void {
    if (!this.signUpForm().valid()) {
      return;
    }

    const credentials = this.signUpModel();

    if (credentials.password !== credentials.confirmPassword) {
      return;
    }

    this.signUp.emit({
      email: credentials.email,
      password: credentials.password,
    });

    this.submittedSignUpData.set(credentials);

    if (this.signUpTimeout) {
      clearTimeout(this.signUpTimeout);
    }

    this.signUpTimeout = setTimeout(() => {
      this.submittedSignUpData.set(null);
      this.closeSignUpModal();
    }, 10000);
  }

  submitSignIn(): void {
    if (!this.signInForm().valid()) {
      return;
    }

    const credentials = this.signInModel();

    this.signIn.emit(credentials);

    this.submittedSignInData.set(credentials);

    if (this.signInTimeout) {
      clearTimeout(this.signInTimeout);
    }

    this.signInTimeout = setTimeout(() => {
      this.submittedSignInData.set(null);
      this.closeSignInModal();
    }, 10000);
  }

  openSignUpModal(): void {
    this.showSignUpModal.set(true);
  }

  closeSignUpModal(): void {
    this.showSignUpModal.set(false);
    if (this.signUpTimeout) {
      clearTimeout(this.signUpTimeout);
      this.signUpTimeout = undefined;
    }
    this.submittedSignUpData.set(null);
    this.signUpModel.set({
      email: '',
      password: '',
      confirmPassword: '',
    });
  }

  openSignInModal(): void {
    this.showSignInModal.set(true);
  }

  closeSignInModal(): void {
    this.showSignInModal.set(false);
    if (this.signInTimeout) {
      clearTimeout(this.signInTimeout);
      this.signInTimeout = undefined;
    }
    this.submittedSignInData.set(null);
    this.signInModel.set({
      email: '',
      password: '',
    });
  }

  ngOnDestroy(): void {
    if (this.signUpTimeout) {
      clearTimeout(this.signUpTimeout);
    }
    if (this.signInTimeout) {
      clearTimeout(this.signInTimeout);
    }
  }
}
