import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { SeedCommonLibService } from './seed-common-lib.service';

describe('SeedCommonLibService', () => {
  let service: SeedCommonLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeedCommonLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
