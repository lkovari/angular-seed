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
} from '@angular/forms/signals';
import { signInSchema, signUpInitialData, signUpSchema, type SignIn, type SignUp } from '../models/signup-signin';

@Component({
  selector: 'lib-signup-signin',
  imports: [CommonModule, Field],
  templateUrl: './signup-signin.component.html',
  styleUrl: './signup-signin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupSigninComponent implements OnDestroy {
  readonly githubLogoPath = input<string>('');

  readonly signUp = output<SignUp>();
  readonly signIn = output<SignIn>();

  readonly signUpModel = signal<SignUp>(signUpInitialData);

  // SignalForm
  readonly signUpForm = form(this.signUpModel, signUpSchema);

  readonly passwordsMatch = computed(() => {
    const model = this.signUpModel();
    return model.password === model.confirmPassword;
  });

  readonly isSignUpFormValid = computed(() => {
    return this.signUpForm().valid() && this.passwordsMatch();
  });

  readonly isSignInFormValid = computed(() => {
    return this.signInForm().valid();
  });

  readonly signInModel = signal<SignIn>(signUpInitialData);

  // SignalForm
  readonly signInForm = form(this.signInModel, signInSchema);

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

  submitSignUp(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!this.signUpForm().valid()) {
      return;
    }

    const credentials = this.signUpModel();

    if (credentials.password !== credentials.confirmPassword) {
      return;
    }

    this.signUp.emit(credentials);

    this.submittedSignUpData.set(credentials);

    if (this.signUpTimeout) {
      clearTimeout(this.signUpTimeout);
    }

    this.signUpTimeout = setTimeout(() => {
      this.submittedSignUpData.set(null);
    }, 10000);
  }

  submitSignIn(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
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
