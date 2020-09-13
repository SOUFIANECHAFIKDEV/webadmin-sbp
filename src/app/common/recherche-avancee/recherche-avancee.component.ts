import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'recherche-avancee',
  templateUrl: './recherche-avancee.component.html',
  styleUrls: ['./recherche-avancee.component.scss']
})
export class RechercheAvanceeComponent {
  showCardBody: boolean = true;
  @Output('OnOpen') OnOpen = new EventEmitter();
  open() {
    this.OnOpen.emit();
  }
}
