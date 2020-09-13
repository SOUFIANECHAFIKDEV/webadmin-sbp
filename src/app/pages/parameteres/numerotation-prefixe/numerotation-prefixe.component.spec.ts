import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumerotationPrefixeComponent } from './numerotation-prefixe.component';

describe('NumerotationPrefixeComponent', () => {
  let component: NumerotationPrefixeComponent;
  let fixture: ComponentFixture<NumerotationPrefixeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumerotationPrefixeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumerotationPrefixeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
