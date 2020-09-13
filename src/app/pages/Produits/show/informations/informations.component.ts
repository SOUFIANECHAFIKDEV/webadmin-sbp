import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Produit } from './../../../../Models/Entities/Produit';
// import { AngularEditorConfig } from '@kolkov/angular-editor';
import { conversion } from 'app/common/prix-conversion/conversion';
@Component({
  selector: 'produit-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit, OnChanges {

  @Input('produit') produit: Produit;
  @Input('PrixParFournisseur') PrixParFournisseur = [];
  @Input('prixParTranche') prixParTranche;
  @Input('allTagsList') allTagsList = [];
  images;
  conversion = new conversion()

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  // editorConfig: AngularEditorConfig = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '25rem',
  //   placeholder: 'Enter text here...',
  //   translate: 'yes',
  // }


  prixTtc(cout_materiel: number, tva: number) {
    if (this.calculate_cout_horaire() != null && cout_materiel != null) {
      return ((this.calculate_cout_horaire() + cout_materiel) * (1 + tva / 100)).toFixed(2)
    } else {
      return 0;
    }
  }

  TotalHt() {
    if (!this.produit) {
      return;
    }
    return (this.calculate_cout_horaire() + this.produit.cout_materiel).toFixed(2)
  }


  calculate_cout_horaire(): any {
    if (!this.produit) {
      return;
    }
    return parseFloat(this.produit.nomber_heure) * parseFloat(this.produit.cout_vente);
  }
}
