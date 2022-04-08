import { TestBed } from '@angular/core/testing';

import { DeteleUsernamePasswordService } from './detele-username-password.service';

describe('DeteleUsernamePasswordService', () => {
  let service: DeteleUsernamePasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeteleUsernamePasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
