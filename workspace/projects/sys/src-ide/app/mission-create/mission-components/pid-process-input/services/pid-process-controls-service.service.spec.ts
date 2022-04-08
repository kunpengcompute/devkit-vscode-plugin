import { TestBed } from '@angular/core/testing';

import { PidProcessControlsServiceService } from './pid-process-controls-service.service';

describe('PidProcessControlsServiceService', () => {
  let service: PidProcessControlsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PidProcessControlsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
