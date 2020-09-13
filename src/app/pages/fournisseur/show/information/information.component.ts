import { Component, OnInit, Input } from '@angular/core';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { Contact } from 'app/Models/Entities/Contact';

@Component({
  selector: 'fournisseur-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  @Input('fournisseur') fournisseur: Fournisseur
  @Input('contacts') contacts: Contact[] = [];
  constructor() { }

  ngOnInit() {
  }

}
