import { TestBed } from '@angular/core/testing';

import { TimingNormalizedService } from './timing-normalized.service';

describe('TimingNormalizedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimingNormalizedService = TestBed.inject(TimingNormalizedService);
    expect(service).toBeTruthy();
  });
});
