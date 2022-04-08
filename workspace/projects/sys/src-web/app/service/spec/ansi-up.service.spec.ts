import { TestBed } from '@angular/core/testing';

import { AnsiUpService } from '../ansi-up.service';

describe('AnsiUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AnsiUpService = TestBed.inject(AnsiUpService);
    expect(service).toBeTruthy();
  });
});
