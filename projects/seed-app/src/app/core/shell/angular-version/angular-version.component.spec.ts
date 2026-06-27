import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import * as angular from '@angular/forms';


import { AngularVersionComponent } from './angular-version.component';

function getHostElement<T>(fixture: ComponentFixture<T>): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const el = fixture.nativeElement;

  if (el instanceof HTMLElement) {
    return el;
  }

  throw new Error('fixture.nativeElement is not an HTMLElement');
}

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

    const host = getHostElement(fixture);
    const versionText = host.textContent;
    expect(versionText).toContain('Angular version');
    expect(versionText).toContain(angular.VERSION.full);
  });

  it('should have correct Angular version format', () => {
    expect(component.angularVersion()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('should render version in container div', () => {
    fixture.detectChanges();

    const host = getHostElement(fixture);
    const container = host.querySelector('.angular-version-container');
    expect(container).toBeTruthy();
    expect(container?.textContent ?? '').toContain(angular.VERSION.full);
  });
});
