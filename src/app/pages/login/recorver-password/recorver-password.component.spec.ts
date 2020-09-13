import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecorverPasswordComponent } from './recorver-password.component';

describe('RecorverPasswordComponent', () => {
  let component: RecorverPasswordComponent;
  let fixture: ComponentFixture<RecorverPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecorverPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecorverPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
