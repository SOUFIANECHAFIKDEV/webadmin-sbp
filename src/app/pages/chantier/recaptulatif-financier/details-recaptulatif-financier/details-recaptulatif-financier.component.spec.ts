import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsRecaptulatifFinancierComponent } from './details-recaptulatif-financier.component';

describe('DetailsRecaptulatifFinancierComponent', () => {
  let component: DetailsRecaptulatifFinancierComponent;
  let fixture: ComponentFixture<DetailsRecaptulatifFinancierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsRecaptulatifFinancierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsRecaptulatifFinancierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
