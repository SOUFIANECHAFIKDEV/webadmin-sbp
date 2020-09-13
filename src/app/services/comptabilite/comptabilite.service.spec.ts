import { TestBed } from '@angular/core/testing';

import { ComptabiliteService } from './comptabilite.service';

describe('ComptabiliteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComptabiliteService = TestBed.get(ComptabiliteService);
    expect(service).toBeTruthy();
  });
});
