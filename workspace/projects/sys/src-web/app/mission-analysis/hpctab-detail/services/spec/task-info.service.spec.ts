import { TestBed } from '@angular/core/testing';

import { TaskInfoService } from '../task-info.service';

describe('TaskInfoService', () => {
  let service: TaskInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
