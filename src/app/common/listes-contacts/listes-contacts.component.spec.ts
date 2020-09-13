import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListesContactsComponent } from './listes-contacts.component';

describe('ListesContactsComponent', () => {
  let component: ListesContactsComponent;
  let fixture: ComponentFixture<ListesContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListesContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListesContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
