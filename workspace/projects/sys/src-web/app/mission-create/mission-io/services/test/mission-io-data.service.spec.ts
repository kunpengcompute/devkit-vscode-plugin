import { TestBed } from '@angular/core/testing';

import { MissionIoDataService } from '../mission-io-data.service';

describe('MissionIoDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MissionIoDataService = TestBed.inject(MissionIoDataService);
    expect(service).toBeTruthy();
  });
});
