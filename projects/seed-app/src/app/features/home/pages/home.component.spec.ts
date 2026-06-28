import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideI18nTesting } from '../../../../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../../../../seed-i18n-lib/src/public-api';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    }).compileComponents();

    const translationService = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
    const initPromise = translationService.initialize();
    httpMock.expectOne('/assets/i18n/en.json').flush({
      features: {
        home: {
          welcome: "Welcome to the LKővári's seed app",
          loadingReadme: 'Loading README...',
          readmeLoadFailed: 'Failed to load README.md',
        },
      },
    });
    await initPromise;

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('README.md').flush('# README');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render translated welcome text', () => {
    const compiled: unknown = fixture.nativeElement;
    if (!(compiled instanceof HTMLElement)) {
      throw new Error('Expected nativeElement to be HTMLElement');
    }

    expect(compiled.textContent).toContain("Welcome to the LKővári's seed app");
  });
});
