import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideI18nTesting } from '../../../../../../seed-i18n-lib/src/public-api';
import { TranslationService } from '../../../../../../seed-i18n-lib/src/public-api';

import { LeftSideMenuComponent } from './left-side-menu.component';

describe('LeftSideMenuComponent', () => {
  let component: LeftSideMenuComponent;
  let fixture: ComponentFixture<LeftSideMenuComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LeftSideMenuComponent],
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
      navigation: { home: 'Home' },
    });
    await initPromise;

    fixture = TestBed.createComponent(LeftSideMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
