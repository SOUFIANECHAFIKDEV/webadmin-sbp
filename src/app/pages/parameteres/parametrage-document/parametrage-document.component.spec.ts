import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ParametrageDocumentComponent } from './parametrage-document.component';



describe('ParametrageDocumentComponent', () => {
  let component: ParametrageDocumentComponent;
  let fixture: ComponentFixture<ParametrageDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageDocumentComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrageDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
