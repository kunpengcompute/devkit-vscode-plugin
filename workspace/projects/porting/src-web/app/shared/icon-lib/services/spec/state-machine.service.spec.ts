import { TestBed } from '@angular/core/testing';

import { StateMachineService } from '../state-machine.service';

describe('StateMachineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StateMachineService = TestBed.inject(StateMachineService);
    expect(service).toBeTruthy();
  });
});
