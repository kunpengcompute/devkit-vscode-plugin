import { TestBed } from '@angular/core/testing';

import { MissionHpcImportService } from '../mission-hpc-import.service';

describe('MissionHpcImportService', () => {
  let service: MissionHpcImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionHpcImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
