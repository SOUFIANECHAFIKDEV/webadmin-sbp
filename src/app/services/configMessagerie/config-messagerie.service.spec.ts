import { TestBed } from '@angular/core/testing';

import { ConfigMessagerieService } from './config-messagerie.service';

describe('ConfigMessagerieService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfigMessagerieService = TestBed.get(ConfigMessagerieService);
    expect(service).toBeTruthy();
  });
});
