import { TestBed } from '@angular/core/testing';

import { ServerNodeService } from './server-node.service';

describe('ServerNodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServerNodeService = TestBed.inject(ServerNodeService);
    expect(service).toBeTruthy();
  });
});
