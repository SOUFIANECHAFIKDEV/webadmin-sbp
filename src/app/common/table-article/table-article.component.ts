import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { CalculTva } from 'app/Models/calcul-tva';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ProduitService } from 'app/services/produit/produit.service';
import { Produit } from 'app/Models/Entities/Produit';
import { Lots, LotProduits } from 'app/Models/Entities/Lots';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { DelaiGaranties, StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { SelectLotComponent } from './select-lot/select-lot.component';
import { SelectProduitComponent } from './select-produit/select-produit.component';

class ArticleType {
  produit = 1;
  lot = 2;
}

declare var jQuery: any;

@Component({
  selector: 'table-article',
  templateUrl: './table-article.component.html',
  styleUrls: ['./table-article.component.scss'],
})
export class TableArticleComponent implements OnInit, OnChanges {



  @Input('load') load: { getDateToSave };
  @Input('showPrices') showPrices: boolean = true;
  @Input('displaysGeneralCalculation') displaysGeneralCalculation: boolean = true;
  @Input('showAdditionalInfos') showAdditionalInfos = true;
  @Input('negativeMode') negativeMode = false;
  @Input('puc') puc = 0;
  @Input('partProrata') prorata = 0;
  @Input('remiseGloabl') remiseGloabl = 0;
  retenueGarantie = 0;

  @Input('typeRemiseGloabl') typeRemiseGloabl: string = '€';
  @Input('tvaGlobal') tvaGlobal = null;
  @Input('readOnly') readOnly: boolean = true;
  @Input('isAvoir') isAvoir = false;
  @Input('isIntervention') isIntervention = false;
  @Input('articles') articles: {
    data: Produit | Lots;
    qte: number;
    type: number;
    remise: number;
  }[] = [];
  articlesdata: {
    data: Produit | Lots;
    qte: number;
    type: number;
    remise: number;
  }[] = [];

  produits: Produit[] = [];
  produitLot = [];
  lotsProduitsTmp: { data: LotProduits | Lots; qte: number; type: number; remise: number }[] = [];
  list = [];
  loadingFinished = false; // si la liste chargé
  search = ''; // zone de recherche
  totalPage = 1; // total des pages
  page = 1; // Current page des
  articleType: ArticleType = new ArticleType();
  prod: Produit;
  produirres: any;
  res: { id: number; nom: string; produits: Produit[] };
  collapseClosed: number[] = [];
  AllCollapsesIsClosed: boolean = true;
  lotP: LotProduits[];
  pres: any;
  pres2: any;
  ProduitinLot: any;
  Lot: number;
  cachedIdlot: number = 0;
  emitter: any = {};
  idLotUsedForAddProduit: number = null;
  lastUpdatedProduit: number = null;
  montantHT: number = 0;
  totalGeneral = 0;
  globalTotalHTRemise = 0;
  globalTotalTTC = 0;
  MontantHt = 0;
  calcule: ICalcule = new Calcule();
  calculTvas: CalculTva[] = [];
  TotalTva = 0;
  totalTTC = 0;
  montantTva = 0;
  NouveauTotalGeneral = 0;
  @Input('retenueGarantieValue') retenueGarantieValue: number = 0;
  // @Input('statusGarantie') statusGarantie = StatutRetenueGarantie.encours;

  // newLots: string = '';
  @Input('delaiGarantie') delaiGarantie: DelaiGaranties = null;
  // delaiGarantiesEnum: typeof DelaiGaranties = DelaiGaranties;
  @Input("FournisseurList") FournisseurList: Fournisseur[] = null;
  labels: any;
  constructor(
    private produitService: ProduitService,
    private translate: TranslateService,
    private parameteresService: ParameteresService,

    private dialog: MatDialog
  ) { }
  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getCouteVenteFromParamerage();
  }
  LoadListLots() {
    debugger
    let dialogLotConfig = new MatDialogConfig();
    // dialogLotConfig.data = null;
    dialogLotConfig.width = '1500px';
    dialogLotConfig.height = '500px';
    dialogLotConfig.data = { isAvoir: this.isAvoir };
    const dialogRef = this.dialog.open(SelectLotComponent, dialogLotConfig);

    dialogRef.afterClosed().subscribe((data) => {
      if (data && Array.from(data).length) {
        this.articlesdata = data
        //  console.log(this.articlesdata = data)
        data.forEach(lot => {
          lot.data.lotProduits.forEach(p => {
            p.qte = p.qte * lot.qte;
          });
          this.articles.push(lot);
        });
      }

    });
  }

  ngOnChanges() {
    debugger
    this.retenueGarantie = (this.retenueGarantieValue == null || this.retenueGarantieValue == 0) ? 0 : 1;
    setTimeout(() => {

    }, 2000);
    if (this.load == undefined) return;
    this.load.getDateToSave = this.getDateToSave.bind(this);
  }

  setInCollapseClosed(index) {
    if (this.collapseClosed.filter(id => id == index).length == 0) {
      this.collapseClosed.push(index);
    } else {
      this.collapseClosed = this.collapseClosed.filter(id => id != index);
    }
  }

  checkCollapseClosed(index) {
    return this.collapseClosed.filter(id => id == index).length == 0;
  }

  setAllCollapsesClosed() {
    this.collapseClosed = [];
    this.AllCollapsesIsClosed = false;
    this.articles.forEach((article, index) => {
      if (article.type == this.articleType.lot) {
        this.collapseClosed.push(index);
      }
    });
  }

  addProduits(produitsTmp) {
    jQuery('#selectProduits').modal('hide');
    if (this.idLotUsedForAddProduit == null) {
      produitsTmp.forEach(produit => {
        (produit.data as Produit).historique = '';
        this.articles.push(produit);
      });
    } else {
      produitsTmp.forEach(produit => {
        this.articles.map(article => {
          if (article.data.id == this.idLotUsedForAddProduit) {
            let lotProduits: LotProduits = {
              id: -1,
              idLot: this.idLotUsedForAddProduit,
              idProduit: produit.data.id,
              qte: parseFloat(produit.qte),
              idProduitNavigation: produit.data as Produit,
            };
            article.data.lotProduits.push(lotProduits);
          }
        });
      });
      this.idLotUsedForAddProduit = null;
    }
  }

  CalculTotalHTLOT(LotArticls) {
    const totalHtLot = LotArticls.map(article => {
      return this.TotalHt(article.idProduitNavigation.prixHt, article.qte)
    })
    const totalHt = totalHtLot.reduce((total, num) => {
      return total + num;
    });
    return totalHt.toFixed(2);
  }
  CalculTotalTtcLOT(LotArticls) {
    const totalTtcLot = LotArticls.map(article => {
      if (this.tvaGlobal == null) {
        return this.prixTtc(article.idProduitNavigation.prixHt, article.qte, article.idProduitNavigation.tva)
      } else {
        return this.prixTtc(article.idProduitNavigation.prixHt, article.qte, this.tvaGlobal)
      }
    })
    return totalTtcLot.reduce((total, num) => {
      return total + num;
    }).toFixed(2);
  }

  // async addLots(lotsTmp) {
  //   jQuery('#selectLots').modal('hide');
  //   lotsTmp.forEach(lot => {
  //     lot.data.lotProduits.forEach(p => {
  //       p.qte = p.qte * lot.qte;
  //     });
  //     this.articles.push(lot);
  //   });
  // }

  getProduit(idLots: number) {
    return new Promise((resolve, reject) => {
      this.produitService.Get(idLots).subscribe(
        res => {
          resolve(res);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  getLotProduits(produitsIDS: number[]): Promise<Produit[]> {
    return new Promise((resolve, reject) => {
      this.produitService
        .getLotProduits(
          this.search,
          this.page,
          AppSettings.MAX_GET_DATA,
          'reference',
          'desc',
          [''],
          produitsIDS
        )
        .subscribe(
          res => {
            resolve(res.list);
          },
          err => {
            reject(err);
          }
        );
    });
  }

  cout_horaire(nomber_heure, cout_vente) {
    return nomber_heure * cout_vente;
  }

  calculate_cout_horaire(Nomber_heure, Cout_vente): any {
    return parseFloat(Nomber_heure) * parseFloat(Cout_vente);
  }

  prixTtc(prixHt, qte, tva) {
    const tvaEnPr = 1 + parseFloat(tva) / 100;
    return parseFloat(prixHt) * parseFloat(qte) * tvaEnPr;
  }

  TotalHt(prixHt, qte) {
    return prixHt * qte;
  }

  getLotProduitDetail(idlot: number, produits: any) {
    const produitsIDS: number[] = produits.id;
    this.loadingFinished = false;
    if (this.cachedIdlot != idlot) {
      this.cachedIdlot = idlot;
      this.produitService
        .getLotProduits(
          this.search,
          this.page,
          AppSettings.MAX_GET_DATA,
          'reference',
          'desc',
          [''],
          produitsIDS
        )
        .subscribe(res => {
          (res.list);
          return res.list;
        });
    }
  }

  LoadListProduit() {
    let dialogProduitConfig = new MatDialogConfig();
    // dialogLotConfig.data = null;
    dialogProduitConfig.width = '1500px';
    dialogProduitConfig.height = '500px';
    dialogProduitConfig.data = { isAvoir: this.isAvoir, isIntervention: this.isIntervention };
    const dialogRef = this.dialog.open(SelectProduitComponent, dialogProduitConfig);

    dialogRef.afterClosed().subscribe((data) => {
      if (data && Array.from(data).length) {
        // this.articlesdata = data
        // //  console.log(this.articlesdata = data)
        // data.forEach(lot => {
        //   lot.data.lotProduits.forEach(p => {
        //     p.qte = p.qte * lot.qte;
        //   });

        // });
        data.forEach(produit => {
          (produit.data as Produit).historique = '';
          this.articles.push(produit);
        });
      }

    });
  }

  // LoadListLots() {
  //   this.emitter.loadLots();
  // }

  createProduitForm(article) {
    if (this.idLotUsedForAddProduit != null) {
      article = {
        data: article == null ? null : article.data,
        qte: article == null ? null : article.qte,
        remise: article == null ? null : article.remise,
        type: null,
      };
    }

    this.emitter.createForm(article);
  }

  reloadPrixParFournisseur() {
    this.emitter.reloadPrixParFournisseur();
  }

  insertNewProduit(produit) {
    debugger
    jQuery('#produitForm').modal('hide');
    if (this.isAvoir == true) {
      produit.data.prixHt = produit.data.prixHt * (-1)
      produit.data.cout_materiel = produit.data.cout_materiel * (-1)
      produit.data.cout_vente = produit.data.cout_vente * (-1)
    }
    if (this.idLotUsedForAddProduit == null) {
      if (this.lastUpdatedProduit == null) {

        this.articles.push(produit);
        return;
      }
      if (this.lastUpdatedProduit != null) {
        this.articles[this.lastUpdatedProduit] = produit;
        return;
      }
    }
    if (this.idLotUsedForAddProduit != null) {
      if (this.lastUpdatedProduit == null) {
        this.articles.map(article => {
          if (article.data.id == this.idLotUsedForAddProduit) {
            let lotProduits: LotProduits = {
              id: -1,
              idLot: this.idLotUsedForAddProduit,
              idProduit: produit.data.id,
              qte: produit.qte,
              idProduitNavigation: produit.data as Produit,
              remise: produit.remise,
            };

            article.data.lotProduits.push(lotProduits);
            return;
          }
        });
      }
      if (this.lastUpdatedProduit != null) {
        this.articles.map(article => {
          if (article.data.id == this.idLotUsedForAddProduit) {
            let lotProduits: LotProduits = {
              id: -1,
              idLot: this.idLotUsedForAddProduit,
              idProduit: produit.data.id,
              qte: produit.qte,
              idProduitNavigation: produit.data as Produit,
            };

            article.data.lotProduits[this.lastUpdatedProduit] = lotProduits;
            return;
          }
        });
      }
    }
  }

  clalcTotalGeneral(): number {

    const articles: Produit[] = this.getProductsOfArticles(this.articles);
    let totalHt = 0;
    articles.forEach(article => {
      totalHt = totalHt + article.prixHt * article.qte;
    });
    this.totalGeneral = totalHt;
    return totalHt;
  }

  clalcNouveauTotalGeneral() {
    if (this.typeRemiseGloabl == '€') {
      this.NouveauTotalGeneral = this.totalGeneral - this.remiseGloabl;
    } else if (this.typeRemiseGloabl == '%') {
      this.NouveauTotalGeneral = this.totalGeneral - (this.remiseGloabl / 100) * this.totalGeneral;
    }
    return this.NouveauTotalGeneral;
  }

  clalcMontantHt() {
    const prorataEnPourcentage = this.prorata / 100 + 1;
    const TotalGeneral =
      this.clalcNouveauTotalGeneral() != 0 ? this.clalcNouveauTotalGeneral() : this.totalGeneral;
    this.MontantHt = (TotalGeneral * 1) / prorataEnPourcentage;
    return this.MontantHt;
  }

  clalcPartProrata() {
    const TotalGeneral =
      this.clalcNouveauTotalGeneral() != 0 ? this.clalcNouveauTotalGeneral() : this.totalGeneral;
    return TotalGeneral - this.MontantHt;
  }

  totalHtRemise(): number {
    this.globalTotalHTRemise = this.totalGeneral - this.remiseGloabl;
    return this.globalTotalHTRemise;
  }

  sumTVA() {
    var groupTvaDistinct = this.getProductsOfArticles(this.articles).filter(
      (value, index, self) => self.map(e => e.tva).indexOf(value.tva) === index
    );
    this.articles.forEach(article => {
      if (article.type == this.articleType.lot) {
      }
    });
  }

  getProductsOfArticles(
    articles: { data: Produit | Lots; qte: number; type: number; remise: number }[]
  ): Produit[] {
    articles = this.selectArticles(articles)
    var articlesTmp: Produit[] = [];
    articles.forEach(article => {
      //si le type d'article est produit
      if (article.type == this.articleType.produit) {
        (article.data as Produit).qte = article.qte;
        (article.data as Produit).remise = article.remise;
        articlesTmp.push(article.data as Produit);
      }

      //si le type d'article est lot
      if (article.type == this.articleType.lot) {
        let lotProduits = (article.data as Lots).lotProduits.map(e => {
          e.idProduitNavigation.qte = e.qte;
          e.idProduitNavigation.remise = e.remise;
          // return e.idProduitNavigation;
          articlesTmp.push(e.idProduitNavigation as Produit);
        });
        // articlesTmp.concat(lotProduits)
      }
    });
    return articlesTmp;
  }


  selectArticles(articles) {
    if ((articles as any).prestation != undefined) {
      let prestation = JSON.parse((articles as any).prestation);
      if (prestation.prestation != undefined) {
        prestation = JSON.parse(prestation.prestation);
      }
      return prestation;
    } else {
      return articles;
    }
  }

  groupTVA(): CalculTva[] {
    this.calculTvas = [];
    if (this.tvaGlobal == null) {
      let articles = this.getProductsOfArticles(this.articles);
      this.calculTvas = this.calcule.calculVentilationRemise(
        articles,
        this.totalGeneral,
        this.remiseGloabl,
        '€'
      );
    } else {
      const totalTTC = this.totalGeneral * (this.tvaGlobal / 100 + 1);
      this.calculTvas.push({
        tva: this.tvaGlobal,
        totalHT: this.totalGeneral,
        totalTTC,
        totalTVA: totalTTC - this.totalGeneral,
        finalValue: 0,
        percente: 0,
        value: 0,
      });
    }
    return this.calculTvas;
  }

  calcTotalTva(): { totalTva: number; totalTTC: number; montantTva: number } {
    try {
      const groupTVA = this.groupTVA()
      const montantTva = groupTVA.reduce((x, y) => x + y.totalTVA, 0);
      const total = this.NouveauTotalGeneral == 0 ? this.totalGeneral : this.NouveauTotalGeneral;
      const TotalTva = (montantTva / total) * 100;
      const totalTTC = total + montantTva;
      return { totalTva: TotalTva, totalTTC: totalTTC, montantTva: montantTva };
    } catch (err) {
      console.log(err)
    }
  }

  calcParticipationPuc() {
    const puc = parseFloat((this.puc / 100).toFixed(5));
    return puc * parseFloat(this.MontantHt.toFixed(5));
  }

  calcTotalGeneralTtc() {
    return this.calcTotalTva().totalTTC;
  }

  calcMontantHT(totalHt, prorata) {
    prorata = prorata / 100 + 1;
    this.montantHT = (totalHt * 1) / prorata;
    return this.montantHT;
  }

  getDateToSave(callBack) {
    const calcTotalTva = this.calcTotalTva();
    callBack({
      prestation: JSON.stringify(this.articles),
      totalHt: this.MontantHt.toFixed(2),
      totalTtc: calcTotalTva.totalTTC.toFixed(2),
      tva: JSON.stringify(this.groupTVA()),
      remise: this.remiseGloabl,
      typeRemise: this.typeRemiseGloabl,
      prorata: this.prorata,
      puc: this.puc,
      tvaGlobal: this.tvaGlobal,
      retenueGarantie: this.retenueGarantie == 1 ? this.retenueGarantieValue : null,
      delaiGarantie: this.delaiGarantie,
      totalTVA: calcTotalTva.totalTva,
    });

  }

  removeArticle(i, ii) {
    if (ii == null) {
      this.articles.splice(i, 1);
    } else {
      this.articles[i].data.lotProduits.splice(ii, 1);
    }
  }

  getCouteVenteFromParamerage() {
    this.parameteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {
      let parametrage = JSON.parse(res.contenu);
      if (!this.readOnly && this.retenueGarantie == 0) {
        this.retenueGarantieValue = parametrage.retenueGarantie;
      }
    });
  }
  addNewLots() {

  }
  // addNewLots() {
  //   let data: Lots = {
  //     nom: this.newLots,
  //     description: '',
  //     lotProduits: [],
  //     id: 0,
  //   };

  //   this.articles.push({
  //     qte: 0,
  //     data,
  //     remise: 0,
  //     type: this.articleType.lot,
  //   });
  //   jQuery('#addLot').modal('hide');
  // }

  annulerTVAGlobal() {
    this.tvaGlobal = null;
  }

}
