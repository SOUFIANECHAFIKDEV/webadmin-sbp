import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueEmailComponent } from './historique-email.component';

describe('HistoriqueEmailComponent', () => {
  let component: HistoriqueEmailComponent;
  let fixture: ComponentFixture<HistoriqueEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoriqueEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoriqueEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
