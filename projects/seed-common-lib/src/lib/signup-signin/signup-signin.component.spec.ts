import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSigninComponent } from './signup-signin.component';

describe('SignupSigninComponent', () => {
  let component: SignupSigninComponent;
  let fixture: ComponentFixture<SignupSigninComponent>;

  const createMockEvent = (): Event => {
    const event = new Event('submit');
    Object.defineProperty(event, 'preventDefault', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(event, 'stopPropagation', {
      value: vi.fn(),
      writable: true,
    });
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupSigninComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with modals closed', () => {
      expect(component.showSignUpModal()).toBe(false);
      expect(component.showSignInModal()).toBe(false);
    });

    it('should initialize with no submitted data', () => {
      expect(component.submittedSignUpData()).toBeNull();
      expect(component.submittedSignInData()).toBeNull();
    });

    it('should initialize forms with empty values', () => {
      const signUpModel = component.signUpModel();
      const signInModel = component.signInModel();

      expect(signUpModel.email).toBe('');
      expect(signUpModel.password).toBe('');
      expect(signUpModel.confirmPassword).toBe('');

      expect(signInModel.email).toBe('');
      expect(signInModel.password).toBe('');
    });

    it('should have default githubLogoPath input', () => {
      expect(component.githubLogoPath()).toBe('');
    });
  });

  describe('Form Validation - Sign Up', () => {
    it('should mark email as invalid when empty', () => {
      fixture.detectChanges();

      expect(component.signUpForm.email().invalid()).toBe(true);
      const errors = component.signUpForm.email().errors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.message === 'Email is required')).toBe(true);
    });

    it('should mark email as invalid when format is incorrect', () => {
      component.signUpModel.set({
        email: 'invalid-email',
        password: '',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.signUpForm.email().invalid()).toBe(true);
      const errors = component.signUpForm.email().errors();
      expect(
        errors.some((e) => e.message === 'Enter a valid email address'),
      ).toBe(true);
    });

    it('should mark email as valid when format is correct', () => {
      component.signUpModel.set({
        email: 'test@example.com',
        password: '',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.signUpForm.email().valid()).toBe(true);
    });

    it('should mark password as invalid when empty', () => {
      fixture.detectChanges();

      expect(component.signUpForm.password().invalid()).toBe(true);
      const errors = component.signUpForm.password().errors();
      expect(errors.some((e) => e.message === 'Password is required')).toBe(
        true,
      );
    });

    it('should mark password as invalid when too short', () => {
      component.signUpModel.set({
        email: '',
        password: '1234',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.signUpForm.password().invalid()).toBe(true);
      const errors = component.signUpForm.password().errors();
      expect(
        errors.some(
          (e) => e.message === 'Password must be at least 5 characters',
        ),
      ).toBe(true);
    });

    it('should mark password as valid when length is sufficient', () => {
      component.signUpModel.set({
        email: '',
        password: '12345',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.signUpForm.password().valid()).toBe(true);
    });

    it('should mark confirmPassword as invalid when empty', () => {
      fixture.detectChanges();

      expect(component.signUpForm.confirmPassword().invalid()).toBe(true);
      const errors = component.signUpForm.confirmPassword().errors();
      expect(
        errors.some((e) => e.message === 'Confirm password is required'),
      ).toBe(true);
    });

    it('should show passwordsmismatch error when passwords do not match', () => {
      component.signUpModel.set({
        email: '',
        password: 'password123',
        confirmPassword: 'password456',
      });
      fixture.detectChanges();

      expect(component.passwordsMatch()).toBe(false);
    });

    it('should not show passwordsmismatch error when passwords match', () => {
      component.signUpModel.set({
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      expect(component.passwordsMatch()).toBe(true);
    });

    it('should not show passwordsmismatch error when fields are empty', () => {
      component.signUpModel.set({
        email: '',
        password: '',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.passwordsMatch()).toBe(true);
    });
  });

  describe('Form Validation - Sign In', () => {
    it('should mark email as invalid when empty', () => {
      fixture.detectChanges();

      expect(component.signInForm.email().invalid()).toBe(true);
      const errors = component.signInForm.email().errors();
      expect(errors.some((e) => e.message === 'Email is required')).toBe(true);
    });

    it('should mark email as invalid when format is incorrect', () => {
      component.signInModel.set({ email: 'invalid-email', password: '' });
      fixture.detectChanges();

      expect(component.signInForm.email().invalid()).toBe(true);
      const errors = component.signInForm.email().errors();
      expect(
        errors.some((e) => e.message === 'Enter a valid email address'),
      ).toBe(true);
    });

    it('should mark password as invalid when empty', () => {
      fixture.detectChanges();

      expect(component.signInForm.password().invalid()).toBe(true);
      const errors = component.signInForm.password().errors();
      expect(errors.some((e) => e.message === 'Password is required')).toBe(
        true,
      );
    });

    it('should mark password as invalid when too short', () => {
      component.signInModel.set({ email: '', password: '1234' });
      fixture.detectChanges();

      expect(component.signInForm.password().invalid()).toBe(true);
      const errors = component.signInForm.password().errors();
      expect(
        errors.some(
          (e) => e.message === 'Password must be at least 5 characters',
        ),
      ).toBe(true);
    });
  });

  describe('Modal Management', () => {
    it('should open signup modal', () => {
      component.openSignUpModal();
      expect(component.showSignUpModal()).toBe(true);
    });

    it('should close signup modal', () => {
      component.openSignUpModal();
      component.closeSignUpModal();
      expect(component.showSignUpModal()).toBe(false);
    });

    it('should open signin modal', () => {
      component.openSignInModal();
      expect(component.showSignInModal()).toBe(true);
    });

    it('should close signin modal', () => {
      component.openSignInModal();
      component.closeSignInModal();
      expect(component.showSignInModal()).toBe(false);
    });

    it('should clear submitted data when closing signup modal', () => {
      component.submittedSignUpData.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      component.closeSignUpModal();
      expect(component.submittedSignUpData()).toBeNull();
    });

    it('should clear submitted data when closing signin modal', () => {
      component.submittedSignInData.set({
        email: 'test@example.com',
        password: 'password123',
      });
      component.closeSignInModal();
      expect(component.submittedSignInData()).toBeNull();
    });
  });

  describe('Form Submission - Sign Up', () => {
    it('should not submit when form is invalid', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should emit signUp event with email and password when form is valid', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).toHaveBeenCalledOnce();
      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      subscription.unsubscribe();
    });

    it('should store submitted data after successful submission', () => {
      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(component.submittedSignUpData()).toEqual({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });

    it('should validate all fields on submit attempt', () => {
      component.submitSignUp(createMockEvent());
      fixture.detectChanges();

      expect(component.signUpForm().invalid()).toBe(true);
    });
  });

  describe('Form Submission - Sign In', () => {
    it('should not submit when form is invalid', () => {
      const signInSpy = vi.fn();
      const subscription = component.signIn.subscribe(signInSpy);

      component.submitSignIn(createMockEvent());

      expect(signInSpy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should emit signIn event with email and password when form is valid', () => {
      const signInSpy = vi.fn();
      const subscription = component.signIn.subscribe(signInSpy);

      component.signInModel.set({
        email: 'test@example.com',
        password: 'password123',
      });
      fixture.detectChanges();

      component.submitSignIn(createMockEvent());

      expect(signInSpy).toHaveBeenCalledOnce();
      expect(signInSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      subscription.unsubscribe();
    });

    it('should store submitted data after successful submission', () => {
      component.signInModel.set({
        email: 'test@example.com',
        password: 'password123',
      });
      fixture.detectChanges();

      component.submitSignIn(createMockEvent());

      expect(component.submittedSignInData()).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should validate all fields on submit attempt', () => {
      component.submitSignIn(createMockEvent());
      fixture.detectChanges();

      expect(component.signInForm().invalid()).toBe(true);
    });
  });

  describe('Submitted Data Timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should clear submitted signup data after 10 seconds', () => {
      component.openSignUpModal();
      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());
      expect(component.submittedSignUpData()).not.toBeNull();

      vi.advanceTimersByTime(10000);

      expect(component.submittedSignUpData()).toBeNull();
      expect(component.showSignUpModal()).toBe(true);
    });

    it('should clear submitted signin data after 10 seconds', () => {
      component.openSignInModal();
      component.signInModel.set({
        email: 'test@example.com',
        password: 'password123',
      });
      fixture.detectChanges();

      component.submitSignIn(createMockEvent());
      expect(component.submittedSignInData()).not.toBeNull();

      vi.advanceTimersByTime(10000);

      expect(component.submittedSignInData()).toBeNull();
      expect(component.showSignInModal()).toBe(true);
    });

    it('should clear previous timeout when submitting again', () => {
      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());
      vi.advanceTimersByTime(5000);

      component.signUpModel.set({
        email: 'test2@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();
      component.submitSignUp(createMockEvent());

      vi.advanceTimersByTime(5000);
      expect(component.submittedSignUpData()).not.toBeNull();

      vi.advanceTimersByTime(5000);
      expect(component.submittedSignUpData()).toBeNull();
    });

    it('should cancel timeout when closing modal manually', () => {
      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());
      component.openSignUpModal();

      vi.advanceTimersByTime(5000);
      component.closeSignUpModal();

      vi.advanceTimersByTime(10000);
      expect(component.submittedSignUpData()).toBeNull();
    });
  });

  describe('Signal Forms API', () => {
    it('should return signup form from signal', () => {
      const signUpForm = component.signUpForm();
      expect(signUpForm).toBeTruthy();
      expect(component.signUpForm.email).toBeTruthy();
      expect(component.signUpForm.password).toBeTruthy();
      expect(component.signUpForm.confirmPassword).toBeTruthy();
    });

    it('should return signin form from signal', () => {
      const signInForm = component.signInForm();
      expect(signInForm).toBeTruthy();
      expect(component.signInForm.email).toBeTruthy();
      expect(component.signInForm.password).toBeTruthy();
    });

    it('should update form state when model changes', () => {
      component.signUpModel.set({
        email: 'test@example.com',
        password: '',
        confirmPassword: '',
      });
      fixture.detectChanges();

      expect(component.signUpModel().email).toBe('test@example.com');
    });
  });

  describe('Input/Output', () => {
    it('should accept githubLogoPath input', () => {
      const testPath = 'assets/github-logo.png';
      fixture.componentRef.setInput('githubLogoPath', testPath);
      fixture.detectChanges();

      expect(component.githubLogoPath()).toBe(testPath);
    });

    it('should emit signUp output event', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      subscription.unsubscribe();
    });

    it('should emit signIn output event', () => {
      const signInSpy = vi.fn();
      const subscription = component.signIn.subscribe(signInSpy);

      component.signInModel.set({
        email: 'test@example.com',
        password: 'password123',
      });
      fixture.detectChanges();

      component.submitSignIn(createMockEvent());

      expect(signInSpy).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      subscription.unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid submissions', () => {
      vi.useFakeTimers();

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());
      vi.advanceTimersByTime(5000);
      component.submitSignUp(createMockEvent());
      vi.advanceTimersByTime(5000);

      expect(component.submittedSignUpData()).not.toBeNull();

      vi.advanceTimersByTime(5000);
      expect(component.submittedSignUpData()).toBeNull();
    });

    it('should not submit when email is missing', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: '',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should not submit when password is missing', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: 'test@example.com',
        password: '',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should not submit when confirmPassword is missing', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: '',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should not submit when passwords do not match', () => {
      const signUpSpy = vi.fn();
      const subscription = component.signUp.subscribe(signUpSpy);

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());

      expect(signUpSpy).not.toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should handle form reset after submission', () => {
      vi.useFakeTimers();

      component.signUpModel.set({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      fixture.detectChanges();

      component.submitSignUp(createMockEvent());
      expect(component.submittedSignUpData()).not.toBeNull();

      vi.advanceTimersByTime(10000);
      expect(component.submittedSignUpData()).toBeNull();
    });
  });
});
