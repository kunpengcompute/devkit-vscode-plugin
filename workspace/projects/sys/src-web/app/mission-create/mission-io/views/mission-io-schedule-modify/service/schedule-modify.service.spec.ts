import { TestBed } from '@angular/core/testing';

import { ScheduleModifyService } from './schedule-modify.service';

describe('ScheduleModifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScheduleModifyService = TestBed.inject(ScheduleModifyService);
    expect(service).toBeTruthy();
  });
});
