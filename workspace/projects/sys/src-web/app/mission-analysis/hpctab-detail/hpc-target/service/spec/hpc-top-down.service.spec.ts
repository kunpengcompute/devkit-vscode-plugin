import { TestBed } from '@angular/core/testing';

import { HpcTopDownService } from '../hpc-top-down.service';

describe('HpcTopDownService', () => {
  let service: HpcTopDownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcTopDownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
