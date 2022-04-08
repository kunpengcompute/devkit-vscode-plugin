import { TestBed } from '@angular/core/testing';

import { ServerNodeLigatureService } from './server-node-ligature.service';

describe('ServerNodeLigatureService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServerNodeLigatureService = TestBed.inject(ServerNodeLigatureService);
    expect(service).toBeTruthy();
  });
});
