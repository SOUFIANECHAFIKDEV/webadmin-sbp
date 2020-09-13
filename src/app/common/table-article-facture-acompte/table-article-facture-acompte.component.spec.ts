import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableArticleFactureAcompteComponent } from './table-article-facture-acompte.component';

describe('TableArticleFactureAcompteComponent', () => {
  let component: TableArticleFactureAcompteComponent;
  let fixture: ComponentFixture<TableArticleFactureAcompteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableArticleFactureAcompteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableArticleFactureAcompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
