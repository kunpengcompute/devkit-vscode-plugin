import { TestBed } from '@angular/core/testing';

import { InterfaceService } from './interface.service';

describe('InterfaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InterfaceService = TestBed.inject(InterfaceService);
    expect(service).toBeTruthy();
  });
});
