import { describe, it, expect, beforeEach } from 'vitest';
import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedCommonLibComponent } from './seed-common-lib.component';

describe('SeedCommonLibComponent', () => {
  let component: SeedCommonLibComponent;
  let fixture: ComponentFixture<SeedCommonLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeedCommonLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeedCommonLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
