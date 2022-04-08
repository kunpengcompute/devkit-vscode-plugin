import { TestBed } from '@angular/core/testing';

import { CreateLoadingRefService } from './create-loading-ref.service';

describe('CreateLoadingRefService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateLoadingRefService = TestBed.inject(CreateLoadingRefService);
    expect(service).toBeTruthy();
  });
});
