import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncAgendaGoogleComponent } from './sync-agenda-google.component';

describe('SyncAgendaGoogleComponent', () => {
  let component: SyncAgendaGoogleComponent;
  let fixture: ComponentFixture<SyncAgendaGoogleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncAgendaGoogleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncAgendaGoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
