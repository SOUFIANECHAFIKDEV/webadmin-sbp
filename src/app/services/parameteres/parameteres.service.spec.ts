import { TestBed } from '@angular/core/testing';

import { ParameteresService } from './parameteres.service';

describe('ParameteresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParameteresService = TestBed.get(ParameteresService);
    expect(service).toBeTruthy();
  });
});
