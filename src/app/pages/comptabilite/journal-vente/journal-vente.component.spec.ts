import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalVenteComponent } from './journal-vente.component';

describe('JournalVenteComponent', () => {
  let component: JournalVenteComponent;
  let fixture: ComponentFixture<JournalVenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalVenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalVenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
