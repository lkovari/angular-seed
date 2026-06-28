import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideI18nTesting } from '../../../../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../../../../seed-i18n-lib/src/public-api';
import { FeatureBComponent } from './feature-b.component';

describe('FeatureBComponent', () => {
  let component: FeatureBComponent;
  let fixture: ComponentFixture<FeatureBComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [FeatureBComponent],
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
      features: { featureB: { title: 'Feature B' } },
    });
    await initPromise;

    fixture = TestBed.createComponent(FeatureBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
