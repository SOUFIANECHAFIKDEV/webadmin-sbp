import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProduitByFournisseurComponent } from './select-produit.component';

describe('SelectProduitComponent', () => {
  let component: SelectProduitByFournisseurComponent;
  let fixture: ComponentFixture<SelectProduitByFournisseurComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectProduitByFournisseurComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProduitByFournisseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
