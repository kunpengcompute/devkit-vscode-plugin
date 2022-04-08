import { TestBed } from '@angular/core/testing';

import { HpcMemInstructService } from '../hpc-mem-instruct.service';

describe('HpcMemInstructService', () => {
  let service: HpcMemInstructService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcMemInstructService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
