import { TestBed } from '@angular/core/testing';

import { MissionHpcFormService } from '../mission-hpc-form.service';

describe('MissionHpcFormService', () => {
  let service: MissionHpcFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissionHpcFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
