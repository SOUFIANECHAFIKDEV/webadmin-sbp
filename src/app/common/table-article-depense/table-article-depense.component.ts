import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Produit } from 'app/Models/Entities/Produit';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { CalculTva } from 'app/Models/calcul-tva';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { PrixParFournisseur } from 'app/Models/prixParFournisseur';

declare var jQuery: any;

@Component({
  selector: 'table-article-depense',
  templateUrl: './table-article-depense.component.html',
  styleUrls: ['./table-article-depense.component.scss']
})
export class TableArticleDepenseComponent implements OnInit, OnChanges {
  @Input('load') load: { getDateToSave };
  @Input('readOnly') readOnly: boolean = true;
  @Input('IdFournisseur') IdFournisseur = null;
  @Input('articles') articles: {
    data: Produit;
    qte: number;
    type: number;
    remise: number;
  }[] = [];
  produits: Produit[] = [];
  list = [];
  loadingFinished = false; // si la liste chargé
  search = ''; // zone de recherche
  totalPage = 1; // total des pages
  page = 1; // Current page des
  res: { id: number; nom: string; produits: Produit[] };
  collapseClosed: number[] = [];
  AllCollapsesIsClosed: boolean = true;
  montantHT: number = 0;
  totalGeneral = 0;
  globalTotalHTRemise = 0;
  globalTotalTTC = 0;
  MontantHt = 0;
  calcule: ICalcule = new Calcule();
  TotalTva = 0;
  totalTTC = 0;
  montantTva = 0;
  NouveauTotalGeneral = 0;
  remiseGloabl = 0;
  emitter: any = {};
  tva: any
  prix_fournisseur = 0;
  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  ngOnChanges() {
    if (this.load == undefined) return;
    this.load.getDateToSave = this.getDateToSave.bind(this);
  }

  getDateToSave(callBack) {
    const calcTotalTva = this.calcTotalTva();
    callBack({
      prestation: JSON.stringify(this.articles),
      totalHt: this.totalGeneral,
      totalTtc: calcTotalTva.totalTTC,
      tva: JSON.stringify(this.groupTVA()),
      totalTVA: calcTotalTva.totalTva,
    });
  }


  setTvaArticle(articleIndex, event) {
    try {
      if (event.target.value == "") {
        this.articles[articleIndex].data.tva = 0
      } else {
        this.articles[articleIndex].data.tva = event.target.value
      }
    } catch (ex) {
      console.log(ex)
    }
  }

  setPrixFournisseurArticle(articleIndex, event) {
    this.articles[articleIndex].data.prixParFournisseur[0].prix = event.target.value
  }

  prixTtc(qte, articleIndex) {
    this.tva = this.articles[articleIndex].data.tva;
    this.prix_fournisseur = this.articles[articleIndex].data.prixParFournisseur[0].prix;
    if (this.tva != "") {
      const tvaEnPr = 1 + parseFloat(this.tva) / 100;
      return this.prix_fournisseur * parseInt(qte) * tvaEnPr;
    } else {

      this.tva = 0;
      const tvaEnPr = 1 + parseFloat(this.tva) / 100;
      return this.prix_fournisseur * parseInt(qte) * tvaEnPr;
    }

  }

  prixHt(articleIndex, qte) {
    this.prix_fournisseur = this.articles[articleIndex].data.prixParFournisseur[0].prix;
    return this.prix_fournisseur * parseInt(qte);
  }

  calcTotalTva(): { totalTva: number; totalTTC: number; montantTva: number } {
    const montantTva = this.groupTVA().reduce((x, y) => x + y.totalTVA, 0);
    const total = this.NouveauTotalGeneral == 0 ? this.totalGeneral : this.NouveauTotalGeneral;
    const TotalTva = (montantTva / total) * 100;
    const totalTTC = total + montantTva;
    return { totalTva: TotalTva, totalTTC: totalTTC, montantTva: montantTva };
  }

  calcTotalGeneralTtc() {
    return this.calcTotalTva().totalTTC;
  }

  clalcTotalGeneral(): number {
    const articles: Produit[] = this.getProductsOfArticles(this.articles);
    let totalHt = 0;
    articles.forEach(article => {
      totalHt = totalHt + article.prixParFournisseur[0].prix * article.qte;
    });
    this.totalGeneral = totalHt;
    return totalHt;
  }
  groupTVA(): CalculTva[] {
    let calculTvas = [];
    let articles = this.getProductsOfArticles(this.articles);
    calculTvas = this.calcule.calculVentilationRemiseDepense(
      articles,
      this.totalGeneral,
      this.remiseGloabl,
      '€'
    );
    return calculTvas;
  }

  getProductsOfArticles(articles: { data: Produit; qte: number; type: number, remise: number }[]): Produit[] {
    var articlesTmp: Produit[] = [];
    articles.forEach(article => {
      (article.data as Produit).qte = article.qte;
      (article.data as Produit).remise = article.remise;
      articlesTmp.push(article.data as Produit);
    });
    return articlesTmp;
  }

  removeArticle(i, ii) {
    if (ii == null) {
      this.articles.splice(i, 1);
    } else {
      this.articles[i].data.lotProduits.splice(ii, 1);
    }
  }
  LoadListProduit() {
    this.emitter.loadProduit();
  }

  addProduits(produitsTmp) {
    jQuery('#selectProduits').modal('hide'); produitsTmp.forEach(produit => {
      (produit.data as Produit).historique = '';
      this.articles.push(produit);
    });
  }

  selectPrixParFounisseur(prixParFournisseur: PrixParFournisseur[], id: number): number {
    const result = prixParFournisseur.filter(x => x.IdProduit == id && x.idFournisseur == this.IdFournisseur)[0]
    return result != null ? result.prix : null;
  }
}
