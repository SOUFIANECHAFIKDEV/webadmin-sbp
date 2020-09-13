import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalAchatComponent } from './journal-achat.component';

describe('JournalAchatComponent', () => {
  let component: JournalAchatComponent;
  let fixture: ComponentFixture<JournalAchatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalAchatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalAchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
