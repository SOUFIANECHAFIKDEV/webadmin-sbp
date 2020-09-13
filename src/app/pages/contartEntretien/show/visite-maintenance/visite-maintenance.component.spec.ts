import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisiteMaintenanceComponent } from './visite-maintenance.component';

describe('VisiteMaintenanceComponent', () => {
  let component: VisiteMaintenanceComponent;
  let fixture: ComponentFixture<VisiteMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisiteMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisiteMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
