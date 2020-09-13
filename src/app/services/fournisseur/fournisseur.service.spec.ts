import { TestBed, inject } from '@angular/core/testing';
import { FournisseurService } from './fournisseur.service';

describe('FournisseurService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FournisseurService]
    });
  });

  it('should be created', inject([FournisseurService], (service: FournisseurService) => {
    expect(service).toBeTruthy();
  }));


});
