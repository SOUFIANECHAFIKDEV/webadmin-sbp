import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetenueGarantieComponent } from './retenue-garantie.component';

describe('RetenueGarantieComponent', () => {
  let component: RetenueGarantieComponent;
  let fixture: ComponentFixture<RetenueGarantieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetenueGarantieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetenueGarantieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
