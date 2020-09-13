import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Devis } from 'app/Models/Entities/Devis';
import { Facture } from 'app/Models/Entities/Facture';
import * as _ from 'lodash';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { Produit } from 'app/Models/Entities/Produit';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { DelaiGaranties } from 'app/Enums/DelaiGaranties.Enum';


interface CalculResult {
  totaGenerallHt: number,
  totalHt: number,
  totalTtc: number,
  prorata: number,
  tva: () => number,
  puc: number,
  totalAcomptes: number,
  situationCumullee: number,
  resteAPayer: number
}

@Component({
  selector: 'table-article-situation',
  templateUrl: './table-article-situation.component.html',
  styleUrls: ['./table-article-situation.component.scss'],
})

export class TableArticleSituationComponent implements OnInit, OnChanges {

  @Input('devis') devisInfos: Devis;
  @Input('pourcentage') pourcentage = 0;
  @Input('load') load: { getDateToSave };
  @Input('readOnly') readOnly = false;
  @Input('facture') facture: Facture = null;
  @Input('userForAcompt') userForAcompt: boolean = false;
  @Input('retenueGarantieValue') retenueGarantieValue: number = 0;

  @Input('delaiGarantie') delaiGarantie: DelaiGaranties = null;
  retenueGarantie = 0;
  delaiGarantiesEnum: typeof DelaiGaranties = DelaiGaranties;
  typeFacture: typeof TypeFacture = TypeFacture;
  statutFacture: typeof StatutFacture = StatutFacture;
  //retenueGarantie: any;
  calcul: {
    prixHT: number,
    prixTTC: number,
    tva: number,
    situationCumulleeTTC: number,
    situationCumulleeHT: number,
    totalAcomptesHT: number,
    totalAcomptesTTC: number,
    resteAPayerTTC: number,
    resteAPayerHT: number,
    montantHT: number,

    partProrata: number
  };

  prestation: {
    calcul
    data: Produit;
    qte: number;
    type: number;
    remise: number;
  }[] = [];

  calculResult: CalculResult
  factureSituation: Facture[] = [];
  constructor(private parameteresService: ParameteresService) {
    this.calcul = {
      prixHT: 0,
      prixTTC: 0,
      resteAPayerTTC: 0,
      resteAPayerHT: 0,
      situationCumulleeTTC: 0,
      situationCumulleeHT: 0,
      totalAcomptesHT: 0,
      totalAcomptesTTC: 0,
      tva: 0,
      montantHT: 0,
      partProrata: 0
    }

  }
  ngOnInit() {

    // this.retenueGarantie = (this.retenueGarantieValue == null || this.retenueGarantieValue == 0) ? 0 : 1;

  }

  ngOnChanges() {
    console.log('devisInfos', this.devisInfos)
    debugger
    this.getCouteVenteFromParamerage();
    if (this.devisInfos.retenueGarantie != null) {
      this.retenueGarantie = (this.retenueGarantieValue == null || this.retenueGarantieValue == 0) ? 0 : 1;

    }

    if (this.facture != null) {
      this.prestation = JSON.parse(this.facture.prestations);
    }

    if (this.readOnly) {
      this.calcul.tva = ((this.facture.total - this.facture.totalHt) / this.facture.totalHt) * 100
      this.calcul.tva = (JSON.parse(this.facture.tva)[0]).tva;
    }
    // validation
    if (!this.checkDevisInfosIsValidToDispaly(this.devisInfos)) return;
    this.initData(this.pourcentage);
  }

  initData(pourcentage) {
    debugger
    //situation Cumullee
    const situationCumullee: { cumulleeHt: number, cumulleeTTC: number } = this.getSituationsCumullee(this.devisInfos.situation, this.devisInfos.facture);
    this.calcul.situationCumulleeHT = situationCumullee.cumulleeHt;
    this.calcul.situationCumulleeTTC = situationCumullee.cumulleeTTC;

    //total Acomptes
    const totalAcomptes = this.getTotalAcomptes(this.devisInfos.facture);
    this.calcul.totalAcomptesHT = totalAcomptes.totalHT;
    this.calcul.totalAcomptesTTC = totalAcomptes.totalTTC;

    //tva
    this.calcul.tva = ((this.devisInfos.total - this.devisInfos.totalHt) / this.devisInfos.totalHt) * 100

    //récuperer le nomber des facture situation
    const factureSituationCount = this.devisInfos.facture.filter(x => x.typeFacture == TypeFacture.Situation).length;

    //prixTTC
    let restTtc = 0;
    //si cette facture est premiére facture calculer à partir du mantant du devis est n'est pas du reste à payer
    if (factureSituationCount == 0 && !this.userForAcompt) {
      restTtc = this.devisInfos.total;
      this.calcul.prixTTC = (restTtc * ((pourcentage == null ? 0 : pourcentage) / 100)) - totalAcomptes.totalTTC;
    }

    if (factureSituationCount != 0 || this.userForAcompt) {
      restTtc = this.devisInfos.total - (situationCumullee.cumulleeTTC + this.calcul.totalAcomptesTTC);
      this.calcul.prixTTC = (restTtc * ((pourcentage == null ? 0 : pourcentage) / 100));
    }

    if (pourcentage != null) {
      if (this.userForAcompt) {
        this.calcul.totalAcomptesTTC = this.calcul.totalAcomptesTTC + totalAcomptes.totalTTC;
      } else {
        this.calcul.situationCumulleeTTC = this.calcul.situationCumulleeTTC + this.calcul.prixTTC;
      }
    }

    //prixHT
    let restHt = 0;
    if (factureSituationCount == 0 && !this.userForAcompt) {
      restHt = this.devisInfos.totalHt;
      this.calcul.prixHT = (restHt * ((pourcentage == null ? 0 : pourcentage) / 100)) - totalAcomptes.totalHT;
    }
    if (factureSituationCount != 0 || this.userForAcompt) {
      restHt = this.devisInfos.totalHt - (situationCumullee.cumulleeHt + totalAcomptes.totalHT);
      this.calcul.prixHT = (restHt * ((pourcentage == null ? 0 : pourcentage) / 100));
    }

    if (pourcentage != null) {
      if (this.userForAcompt) {
        this.calcul.totalAcomptesHT = this.calcul.totalAcomptesHT + this.calcul.prixHT;
      } else {
        this.calcul.situationCumulleeHT = this.calcul.situationCumulleeHT + this.calcul.prixHT;
      }
    }

    //resteAPayerTTC
    this.calcul.resteAPayerTTC = (this.devisInfos.total - (situationCumullee.cumulleeTTC + totalAcomptes.totalTTC)) - this.calcul.prixTTC;

    //resteAPayerHT
    this.calcul.resteAPayerHT = (this.devisInfos.totalHt - (situationCumullee.cumulleeHt + totalAcomptes.totalHT)) - this.calcul.prixHT;

    //montantHT
    this.calcul.montantHT = this.clalcMontantHt(this.calcul.prixHT, this.devisInfos.prorata);

    //partProrata
    this.calcul.partProrata = this.clalcPartProrata(this.calcul.prixHT, this.devisInfos.prorata);

    this.factureSituation = this.devisInfos.facture.filter(X => X.typeFacture == this.typeFacture.Situation);

    if (this.load == undefined) return;
    this.load.getDateToSave = this.getDateToSave.bind(this);
  }

  /**
   * @description check DevisInfos Is Valid To Dispaly
   */
  checkDevisInfosIsValidToDispaly(devis: Devis)/*: boolean*/ {
    const checkobjetEmpty: () => boolean = () => {
      let objetEmpty = false;
      for (let key in devis) {
        objetEmpty = true;
      }
      return objetEmpty;
    }
    const condition1 = devis != undefined;
    const condition2 = checkobjetEmpty()
    return condition1 && condition2;
  }

  clalcMontantHt(prixHT: number, prorata: number): number {
    return prixHT - (prixHT * (prorata / 100));
  }

  clalcPartProrata(prixHT: number, prorata: number): number {
    return prixHT * (prorata / 100);
  }

  /**
   * @description calculer le total des ancien 'factures en situation'
   */
  getSituationsCumullee(situation: string, factures: Facture[]): { cumulleeHt: number, cumulleeTTC: number } {
    // validation 
    if (situation == null || situation == undefined) return { cumulleeHt: 0, cumulleeTTC: 0 };

    let cumulleeHt = 0, cumulleeTTC = 0;

    // récupérer le montant de chaque 'facture en situation'
    factures.forEach(facture => {
      if (facture.typeFacture == this.typeFacture.Situation && facture.status != StatutFacture.Brouillon && facture.status != StatutFacture.Annule) {
        cumulleeHt = cumulleeHt + facture.totalHt;
        cumulleeTTC = cumulleeTTC + facture.total;
      }
    });
    return { cumulleeHt, cumulleeTTC }
  }

  /**
   * @description calculer le montant total des acomptes
   */
  getTotalAcomptes(factures: Facture[]): { totalTTC: number, totalHT: number } {
    // validation 
    if (factures == undefined || factures.length == 0) return { totalTTC: 0, totalHT: 0 };

    let totalTTC: number = 0, totalHT: number = 0;

    factures.forEach(facture => {
      if (facture.typeFacture == this.typeFacture.Acompte && facture.status != StatutFacture.Brouillon && facture.status != StatutFacture.Annule) {
        totalTTC = totalTTC + facture.total;
        totalHT = totalHT + facture.totalHt;
      }
    });
    return { totalTTC, totalHT };
  }

  /** 
   * @description return object of data to save
   */
  getDateToSave(status: StatutFacture, callBack: any): void {

    if (status == this.statutFacture.Cloture) {
      this.initData(100);
    }
    const pourcentage = status == this.statutFacture.Cloture ? 100 : this.pourcentage;
    callBack({
      prestations: [{
        "data": {
          "typeRemise": "",
          "description": `Facture  ${this.userForAcompt ? "d'acompte" : "situation"}  ${pourcentage}% sur le devis ${this.devisInfos.reference}`,
          "lotProduits": null,
          "nom": `Facture ${this.userForAcompt ? "d'acompte" : "situation"} ${pourcentage}% sur le devis ${this.devisInfos.reference}`,
          "totalHT": this.calcul.prixHT,
          "cout_vente": 0,
          "cout_materiel": 0,
          "nomber_heure": 0,
          "prixHt": this.calcul.prixHT,
          "tva": this.calcul.tva,
          "totalTTC": this.calcul.prixTTC
        },
        "qte": 1,
        "type": 1,
        "remise": 0
      }],
      puc: this.devisInfos.puc,
      prorata: this.devisInfos.prorata,
      tva: this.calcul.tva,
      retenueGarantie: this.retenueGarantie == 1 ? this.retenueGarantieValue : null,
      delaiGarantie: this.delaiGarantie,
      totalHt: this.calcul.prixHT,
      totalTtc: this.calcul.prixTTC,
      resteAPayerTTC: this.calcul.resteAPayerTTC,
      resteAPayerHT: this.calcul.resteAPayerHT,
      situationCumulleeTTC: this.calcul.situationCumulleeTTC,
      situationCumulleeHT: this.calcul.situationCumulleeHT,
      acomptesCumulleeHT: this.calcul.totalAcomptesHT,
      acomptesCumulleeTTC: this.calcul.totalAcomptesTTC
    });
  }
  getCouteVenteFromParamerage() {

    this.parameteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {
      let parametrage = JSON.parse(res.contenu);
      debugger
      console.log("df", this.devisInfos.retenueGarantie);
      if (this.devisInfos.retenueGarantie != null && this.devisInfos.retenueGarantie != undefined) {
        this.retenueGarantieValue = this.devisInfos.retenueGarantie;
        console.log("3", this.retenueGarantieValue)
      } if (this.devisInfos.retenueGarantie == undefined) {
        this.retenueGarantieValue = parametrage.retenueGarantie;
        console.log("1", this.retenueGarantieValue)

      } else {
        this.retenueGarantieValue = parametrage.retenueGarantie;
        console.log("2", this.retenueGarantieValue)
      }
    });
  }
}
