import { TestBed } from '@angular/core/testing';

import { ImportTemplateService } from '../import-template.service';

describe('ImportTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImportTemplateService = TestBed.inject(ImportTemplateService);
    expect(service).toBeTruthy();
  });
});
