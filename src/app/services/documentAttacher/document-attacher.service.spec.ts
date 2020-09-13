import { TestBed } from '@angular/core/testing';

import { DocumentAttacherService } from './document-attacher.service';

describe('DocumentAttacherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentAttacherService = TestBed.get(DocumentAttacherService);
    expect(service).toBeTruthy();
  });
});
