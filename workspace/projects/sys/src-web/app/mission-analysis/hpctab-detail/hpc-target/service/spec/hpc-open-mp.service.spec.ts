import { TestBed } from '@angular/core/testing';

import { HpcOpenMpService } from '../hpc-open-mp.service';

describe('HpcOpenMpService', () => {
  let service: HpcOpenMpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HpcOpenMpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
