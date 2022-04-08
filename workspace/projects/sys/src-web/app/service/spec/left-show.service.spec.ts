import { TestBed } from '@angular/core/testing';

import { LeftShowService } from '../left-show.service';

describe('LeftShowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeftShowService = TestBed.inject(LeftShowService);
    expect(service).toBeTruthy();
  });
});
