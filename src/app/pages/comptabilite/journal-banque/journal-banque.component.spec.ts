import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalBanqueComponent } from './journal-banque.component';

describe('JournalBanqueComponent', () => {
  let component: JournalBanqueComponent;
  let fixture: ComponentFixture<JournalBanqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalBanqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalBanqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
