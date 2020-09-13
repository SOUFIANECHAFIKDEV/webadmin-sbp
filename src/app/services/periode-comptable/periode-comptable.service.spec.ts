import { TestBed } from '@angular/core/testing';

import { PeriodeComptableService } from './periode-comptable.service';

describe('PeriodeComptableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PeriodeComptableService = TestBed.get(PeriodeComptableService);
    expect(service).toBeTruthy();
  });
});
