import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepenseGroupeBCFComponent } from './depense-groupe-bcf.component';

describe('DepenseGroupeBCFComponent', () => {
  let component: DepenseGroupeBCFComponent;
  let fixture: ComponentFixture<DepenseGroupeBCFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepenseGroupeBCFComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepenseGroupeBCFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
