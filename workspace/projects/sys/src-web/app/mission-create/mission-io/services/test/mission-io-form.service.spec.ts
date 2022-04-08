import { TestBed } from '@angular/core/testing';

import { MissionIoFormService } from '../mission-io-form.service';

describe('MissionIoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MissionIoFormService = TestBed.inject(MissionIoFormService);
    expect(service).toBeTruthy();
  });
});
