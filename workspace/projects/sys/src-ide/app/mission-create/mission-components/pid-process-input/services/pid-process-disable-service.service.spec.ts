import { TestBed } from '@angular/core/testing';

import { PidProcessDisableServiceService } from './pid-process-disable-service.service';

describe('PidProcessDisableServiceService', () => {
  let service: PidProcessDisableServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PidProcessDisableServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
