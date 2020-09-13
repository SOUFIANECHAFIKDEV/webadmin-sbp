import { TestBed } from '@angular/core/testing';

import { GammeMaintenanceEquipementService } from './gammemaintenanceequipement.service';

describe('GammemaintenanceequipementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GammeMaintenanceEquipementService = TestBed.get(GammeMaintenanceEquipementService);
    expect(service).toBeTruthy();
  });
});
