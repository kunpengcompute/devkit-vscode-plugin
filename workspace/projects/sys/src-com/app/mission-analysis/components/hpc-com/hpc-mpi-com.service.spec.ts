import { TestBed } from '@angular/core/testing';

import { HpcMpiComService } from './hpc-mpi-com.service';

describe('HpcMpiComService', () => {
  let service: HpcMpiComService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcMpiComService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
