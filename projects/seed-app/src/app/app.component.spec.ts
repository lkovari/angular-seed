import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideI18nTesting } from '../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../seed-i18n-lib/src/public-api';
import { AppComponent } from './app.component';

function createShortcutEvent(
  key: string,
  options: { metaKey?: boolean; ctrlKey?: boolean } = {},
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    shiftKey: true,
    metaKey: options.metaKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    bubbles: true,
    cancelable: true,
  });
}

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideI18nTesting(),
      ],
    });
    await TestBed.compileComponents();

    const translationService = TestBed.inject(TranslationService);
    const httpMock = TestBed.inject(HttpTestingController);
    const initPromise = translationService.initialize();
    httpMock.expectOne('/assets/i18n/en.json').flush({
      languageSelector: { title: 'Select Language' },
    });
    await initPromise;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'seed-app' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('seed-app');
  });

  it('should render main layout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled: unknown = fixture.nativeElement;
    if (!(compiled instanceof HTMLElement)) {
      throw new Error('Expected nativeElement to be HTMLElement');
    }
    const mainLayout = compiled.querySelector('app-main-layout');
    expect(mainLayout).toBeTruthy();
  });

  it('should open wait spinner test modal with Cmd+Shift+W', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openWaitSpinnerTest = vi.spyOn(app, 'openWaitSpinnerTest');

    app.handleKeyboardEvent(createShortcutEvent('w', { metaKey: true }));

    expect(openWaitSpinnerTest).toHaveBeenCalledOnce();
  });

  it('should open signup modal with Cmd+Shift+U', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openSignUpModal = vi.spyOn(app, 'openSignUpModal');

    app.handleKeyboardEvent(createShortcutEvent('u', { metaKey: true }));

    expect(openSignUpModal).toHaveBeenCalledOnce();
  });

  it('should open signin modal with Cmd+Shift+I', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openSignInModal = vi.spyOn(app, 'openSignInModal');

    app.handleKeyboardEvent(createShortcutEvent('i', { metaKey: true }));

    expect(openSignInModal).toHaveBeenCalledOnce();
  });

  it('should open components test modal with Cmd+Shift+C', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openComponentsTests = vi.spyOn(app, 'openComponentsTests');

    app.handleKeyboardEvent(createShortcutEvent('c', { metaKey: true }));

    expect(openComponentsTests).toHaveBeenCalledOnce();
  });

  it('should open language selector with Cmd+Shift+L', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openLanguageSelector = vi.spyOn(app, 'openLanguageSelector');

    app.handleKeyboardEvent(createShortcutEvent('l', { metaKey: true }));

    expect(openLanguageSelector).toHaveBeenCalledOnce();
  });

  it('should open modals with Ctrl+Shift shortcuts on non-Mac keyboards', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    const openSignUpModal = vi.spyOn(app, 'openSignUpModal');
    const openSignInModal = vi.spyOn(app, 'openSignInModal');
    const openComponentsTests = vi.spyOn(app, 'openComponentsTests');

    app.handleKeyboardEvent(createShortcutEvent('u', { ctrlKey: true }));
    app.handleKeyboardEvent(createShortcutEvent('i', { ctrlKey: true }));
    app.handleKeyboardEvent(createShortcutEvent('c', { ctrlKey: true }));

    expect(openSignUpModal).toHaveBeenCalledOnce();
    expect(openSignInModal).toHaveBeenCalledOnce();
    expect(openComponentsTests).toHaveBeenCalledOnce();
  });
});
