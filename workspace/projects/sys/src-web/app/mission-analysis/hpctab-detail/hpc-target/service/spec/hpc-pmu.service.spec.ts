import { TestBed } from '@angular/core/testing';

import { HpcPmuService } from '../hpc-pmu.service';

describe('HpcPmuService', () => {
  let service: HpcPmuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcPmuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
