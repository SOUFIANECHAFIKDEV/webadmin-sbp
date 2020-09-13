import { Component, OnInit, Input } from '@angular/core';
import { CalculTva } from 'app/Models/calcul-tva';
import { Produit } from 'app/Models/Entities/Produit';
import { Lots } from 'app/Models/Entities/Lots';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { ArticleType } from 'app/Models/article-type';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { DelaiGaranties } from 'app/Enums/DelaiGaranties.Enum';

@Component({
  selector: 'table-article-facture-acompte',
  templateUrl: './table-article-facture-acompte.component.html',
  styleUrls: ['./table-article-facture-acompte.component.scss']
})
export class TableArticleFactureAcompteComponent implements OnInit {

  @Input('readOnly') readOnly: boolean = true;
  @Input('puc') puc = 0;
  @Input('partProrata') prorata = 0;
  @Input('retenueGarantieValue') retenueGarantieValue: number = 0;

  @Input('delaiGarantie') delaiGarantie: DelaiGaranties = null;
  retenueGarantie = 0;
  delaiGarantiesEnum: typeof DelaiGaranties = DelaiGaranties;
  @Input('articles') articles: {
    data: Produit | Lots;
    qte: number;
    type: number;
    remise: number;
  }[] = [];

  articleType: ArticleType = new ArticleType();
  totalGeneral = 0;
  montantHT: number = 0;

  globalTotalHTRemise = 0;
  globalTotalTTC = 0;
  MontantHt = 0;
  calcule: ICalcule = new Calcule();
  calculTvas: CalculTva[] = [];
  TotalTva = 0;
  totalTTC = 0;
  montantTva = 0;
  NouveauTotalGeneral = 0;
  @Input('tvaGlobal') tvaGlobal = null;
  grou

  constructor(private parameteresService: ParameteresService) { }

  ngOnInit() {
    if (!this.readOnly) {
      this.getCouteVenteFromParamerage();
    }
    this.retenueGarantie = (this.retenueGarantieValue == null || this.retenueGarantieValue == 0) ? 0 : 1;

  }

  getProductsOfArticles(
    articles: { data: Produit | Lots; qte: number; type: number; remise: number }[]
  ): Produit[] {
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
    this.NouveauTotalGeneral = this.totalGeneral;
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

  groupTVA(): CalculTva[] {
    this.calculTvas = [];
    if (this.tvaGlobal == null) {
      let articles = this.getProductsOfArticles(this.articles);
      this.calculTvas = this.calcule.calculVentilationRemise(
        articles,
        this.totalGeneral,
        0,
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

  calcParticipationPuc() {
    const puc = parseFloat((this.puc / 100).toFixed(5));
    return puc * parseFloat(this.MontantHt.toFixed(5));
  }

  calcTotalGeneralTtc() {
    return this.calcTotalTva().totalTTC;
  }

  calcTotalTva(): { totalTva: number; totalTTC: number; montantTva: number } {
    const montantTva = this.groupTVA().reduce((x, y) => x + y.totalTVA, 0);
    const total = this.NouveauTotalGeneral == 0 ? this.totalGeneral : this.NouveauTotalGeneral;
    const TotalTva = (montantTva / total) * 100;
    const totalTTC = total + montantTva;
    return { totalTva: TotalTva, totalTTC: totalTTC, montantTva: montantTva };
  }

  getCouteVenteFromParamerage() {
    this.parameteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {
      let parametrage = JSON.parse(res.contenu);
      this.retenueGarantieValue = parametrage.retenueGarantie;
    });
  }

}
