import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserPdfComponent } from './visualiser-pdf.component';

describe('VisualiserPdfComponent', () => {
  let component: VisualiserPdfComponent;
  let fixture: ComponentFixture<VisualiserPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualiserPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualiserPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
