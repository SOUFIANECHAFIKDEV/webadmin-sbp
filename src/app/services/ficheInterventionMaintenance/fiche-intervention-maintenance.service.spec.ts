import { TestBed } from '@angular/core/testing';

import { FicheInterventionMaintenanceService } from './fiche-intervention-maintenance.service';

describe('FicheInterventionMaintenanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FicheInterventionMaintenanceService = TestBed.get(FicheInterventionMaintenanceService);
    expect(service).toBeTruthy();
  });
});
