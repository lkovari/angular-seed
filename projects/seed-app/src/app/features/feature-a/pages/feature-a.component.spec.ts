import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideI18nTesting } from '../../../../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../../../../seed-i18n-lib/src/public-api';
import { FeatureAComponent } from './feature-a.component';

async function setupI18n(httpMock: HttpTestingController): Promise<void> {
  const translationService = TestBed.inject(TranslationService);
  const initPromise = translationService.initialize();
  httpMock.expectOne('/assets/i18n/en.json').flush({
    features: { featureA: { title: 'Feature A' } },
  });
  await initPromise;
}

describe('FeatureAComponent', () => {
  let component: FeatureAComponent;
  let fixture: ComponentFixture<FeatureAComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [FeatureAComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18nTesting(),
      ],
    }).compileComponents();

    const httpMock = TestBed.inject(HttpTestingController);
    await setupI18n(httpMock);

    fixture = TestBed.createComponent(FeatureAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
