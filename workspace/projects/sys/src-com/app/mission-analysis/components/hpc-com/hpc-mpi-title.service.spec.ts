import { TestBed } from '@angular/core/testing';

import { HpcMpiTitleService } from './hpc-mpi-title.service';

describe('HpcMpiTitleService', () => {
  let service: HpcMpiTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcMpiTitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
