import { TestBed } from '@angular/core/testing';

import { MissionHpcDataService } from '../mission-hpc-data.service';

describe('MissionHpcDataService', () => {
  let service: MissionHpcDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionHpcDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
