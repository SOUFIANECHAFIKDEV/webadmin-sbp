import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayByAvoirComponent } from './pay-by-avoir.component';

describe('PayByAvoirComponent', () => {
  let component: PayByAvoirComponent;
  let fixture: ComponentFixture<PayByAvoirComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayByAvoirComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayByAvoirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
