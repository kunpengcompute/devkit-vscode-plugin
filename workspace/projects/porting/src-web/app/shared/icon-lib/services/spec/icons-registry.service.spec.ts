import { TestBed } from '@angular/core/testing';

import { IconsRegistryService } from '../icons-registry.service';

describe('IconsRegistryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IconsRegistryService = TestBed.inject(IconsRegistryService);
    expect(service).toBeTruthy();
  });
});
