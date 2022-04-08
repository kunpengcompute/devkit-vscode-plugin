import { TestBed } from '@angular/core/testing';

import { QueryNodeInfoService } from '../query-node-info.service';

describe('QueryNodeInfoService', () => {
  let service: QueryNodeInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryNodeInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
