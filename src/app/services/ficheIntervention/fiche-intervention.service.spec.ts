import { TestBed } from '@angular/core/testing';

import { FicheInterventionService } from './fiche-intervention.service';

describe('FicheInterventionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FicheInterventionService = TestBed.get(FicheInterventionService);
    expect(service).toBeTruthy();
  });
});
