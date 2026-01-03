import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import * as angular from '@angular/forms';

import { AngularVersionComponent } from './angular-version.component';

describe('AngularVersionComponent', () => {
  let component: AngularVersionComponent;
  let fixture: ComponentFixture<AngularVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularVersionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularVersionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize angularVersion signal', () => {
    expect(component.angularVersion()).toBe(angular.VERSION.full);
  });

  it('should display Angular version in template', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const versionText = compiled.textContent;
    expect(versionText).toContain('Angular version');
    expect(versionText).toContain(angular.VERSION.full);
  });

  it('should have correct Angular version format', () => {
    // Angular version should be in format like "20.0.0" or similar
    expect(component.angularVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should render version in container div', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.angular-version-container');
    expect(container).toBeTruthy();
    expect(container?.textContent).toContain(angular.VERSION.full);
  });
});
