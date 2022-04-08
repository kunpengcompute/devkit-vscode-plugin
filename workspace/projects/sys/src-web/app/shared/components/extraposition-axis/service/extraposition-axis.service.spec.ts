import { TestBed } from '@angular/core/testing';

import { ExtrapositionAxisService } from './extraposition-axis.service';

describe('ExtrapositionAxisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExtrapositionAxisService = TestBed.inject(ExtrapositionAxisService);
    expect(service).toBeTruthy();
  });
});
