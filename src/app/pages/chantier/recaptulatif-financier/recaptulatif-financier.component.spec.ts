import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecaptulatifFinancierComponent } from './recaptulatif-financier.component';

describe('RecaptulatifFinancierComponent', () => {
  let component: RecaptulatifFinancierComponent;
  let fixture: ComponentFixture<RecaptulatifFinancierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecaptulatifFinancierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecaptulatifFinancierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
