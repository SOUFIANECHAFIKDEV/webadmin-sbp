import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraireTravailComponent } from './horaire-travail.component';

describe('HoraireTravailComponent', () => {
  let component: HoraireTravailComponent;
  let fixture: ComponentFixture<HoraireTravailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoraireTravailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoraireTravailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
