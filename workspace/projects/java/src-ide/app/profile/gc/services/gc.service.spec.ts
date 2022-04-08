import { TestBed } from '@angular/core/testing';

import { GcService } from './gc.service';

describe('GcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GcService = TestBed.inject(GcService);
    expect(service).toBeTruthy();
  });
});
