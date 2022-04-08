import { TestBed } from '@angular/core/testing';

import { BasicDataService } from '../basic-data.service';

describe('BasicDataService', () => {
  let service: BasicDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
