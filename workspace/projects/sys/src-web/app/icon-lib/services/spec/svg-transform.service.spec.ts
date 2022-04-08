import { TestBed } from '@angular/core/testing';

import { SvgTransformService } from '../svg-transform.service';

describe('SvgTransformService', () => {
  let service: SvgTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
