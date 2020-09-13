import { Component, OnInit, Input } from '@angular/core';
import { Client } from 'app/Models/Entities/Client';
import { BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';
import { Adresse } from 'app/Models/Entities/Adresse';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { StatutDepense } from 'app/Enums/StatutDepense.Enum';

@Component({
  selector: 'bonCommandeFournisseur-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit {
  @Input('bonCommandeFournisseur') bonCommandeFournisseur: BonCommandeFournisseur;



  @Input('articles') articles = [];

  statutBonCommandeFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur
  statutDevis: typeof StatutDevis = StatutDevis
  statutDepense: typeof StatutDepense = StatutDepense
  adresseFacturation: Adresse
  editorConfig: AngularEditorConfig = {
    editable: false,
    spellcheck: false,
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false,
  }
  constructor() { }

  ngOnInit() {

  }

  getAdresseDesignation(data): string {

    try {
      const adresses: Adresse[] = JSON.parse(data)
      const adresse = adresses.filter(x => x.default);
      return adresse.length != 0 ? adresse[0].designation : '';
    } catch (err) {
      return '';
    }
  }


}
