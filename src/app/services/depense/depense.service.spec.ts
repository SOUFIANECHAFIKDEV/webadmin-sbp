import { TestBed } from '@angular/core/testing';

import { DepenseService } from './depense.service';

describe('DepenseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DepenseService = TestBed.get(DepenseService);
    expect(service).toBeTruthy();
  });
});
