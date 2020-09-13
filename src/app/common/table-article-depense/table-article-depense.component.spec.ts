import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableArticleDepenseComponent } from './table-article-depense.component';

describe('TableArticleDepenseComponent', () => {
  let component: TableArticleDepenseComponent;
  let fixture: ComponentFixture<TableArticleDepenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableArticleDepenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableArticleDepenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
