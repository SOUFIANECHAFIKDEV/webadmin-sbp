import { TestBed } from '@angular/core/testing';

import { VisiteMaintenanceService } from './visite-maintenance.service';

describe('VisiteMaintenanceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VisiteMaintenanceService = TestBed.get(VisiteMaintenanceService);
    expect(service).toBeTruthy();
  });
});
