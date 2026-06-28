import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LanguageSelectorComponent } from './language-selector.component';
import { provideI18nTesting } from '../../testing/provide-i18n-testing';
import { TranslationService } from '../../services/translation.service';

describe('LanguageSelectorComponent', () => {
  let component: LanguageSelectorComponent;
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let httpMock: HttpTestingController;
  let translationService: TranslationService;

  function setSelectValue(value: string): void {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    if (!(select instanceof HTMLSelectElement)) {
      throw new Error('Expected locale select element');
    }
    select.value = value;
    select.dispatchEvent(new Event('change'));
  }

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    }).compileComponents();

    translationService = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);

    const initPromise = translationService.initialize();
    httpMock.expectOne('/assets/i18n/en.json').flush({
      languageSelector: {
        title: 'Select Language',
        label: 'Language',
        apply: 'Apply',
        cancel: 'Cancel',
        close: 'Close',
        locales: { en: 'English', hu: 'Hungarian', de: 'German' },
      },
    });
    await initPromise;

    const createdFixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture = createdFixture;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close modal', () => {
    expect(component.showModal()).toBe(false);
    component.openModal();
    expect(component.showModal()).toBe(true);
    component.closeModal();
    expect(component.showModal()).toBe(false);
  });

  it('should apply selected locale', async () => {
    component.openModal();
    setSelectValue('hu');

    const applyPromise = component.applyLocale();
    httpMock.expectOne('/assets/i18n/hu.json').flush({
      languageSelector: {
        title: 'Nyelv kiválasztása',
      },
    });
    await applyPromise;

    expect(translationService.activeLocale()).toBe('hu');
    expect(component.showModal()).toBe(false);
  });

  it('should switch back to English after Hungarian', async () => {
    component.openModal();
    setSelectValue('hu');

    let applyPromise = component.applyLocale();
    httpMock.expectOne('/assets/i18n/hu.json').flush({
      languageSelector: { title: 'Nyelv kiválasztása' },
    });
    await applyPromise;

    component.openModal();
    setSelectValue('en');

    applyPromise = component.applyLocale();
    await applyPromise;

    expect(translationService.activeLocale()).toBe('en');
    expect(translationService.translate('languageSelector.title')).toBe(
      'Select Language',
    );
  });
});
