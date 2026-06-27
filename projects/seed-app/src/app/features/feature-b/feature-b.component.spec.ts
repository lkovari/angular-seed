import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureBComponent } from './feature-b.component';

describe('FeatureBComponent', () => {
  let component: FeatureBComponent;
  let fixture: ComponentFixture<FeatureBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureBComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
