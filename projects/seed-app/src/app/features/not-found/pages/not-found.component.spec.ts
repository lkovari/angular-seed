import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideI18nTesting } from '../../../../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../../../../seed-i18n-lib/src/public-api';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    }).compileComponents();

    const translationService = TestBed.inject(TranslationService);
    const httpMock = TestBed.inject(HttpTestingController);
    const initPromise = translationService.initialize();
    httpMock.expectOne('/assets/i18n/en.json').flush({
      features: { notFound: { title: 'Invalid Route Path.' } },
    });
    await initPromise;

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
