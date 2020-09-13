import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { Produit } from 'app/Models/Entities/Produit';
import { ArticleType } from 'app/Models/article-type';
import { ProduitService } from 'app/services/produit/produit.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
  selector: 'select-produit-fournisseur',
  templateUrl: './select-produit.component.html',
  styleUrls: ['./select-produit.component.scss']
})
export class SelectProduitByFournisseurComponent implements OnChanges, OnInit {
  @Input('reload') reload: { loadProduit };
  @Output('ONAdd') ONAdd = new EventEmitter();
  @Input('IdFournisseur') IdFournisseur = null;

  search = ""; // zone de recherche
  page = 1; // Current page des
  produits: Produit[] = [];
  loadingFinished = false; // si la liste chargé
  totalPage = 1; // total des pages
  produitsTmp: { data: (Produit), qte: number, remise: number, type: number }[] = []; // les Produit choisi dans popup
  articleType: ArticleType = new ArticleType();

  constructor(private produitService: ProduitService, private translate: TranslateService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  ngOnChanges(): void {

    this.reload.loadProduit = this.getProduits.bind(this);
  }


  //récuperer la liste des produits
  getProduits() {
    //prixparfournisseur
    this.produitsTmp = [];
    this.loadingFinished = false;
    this.produitService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "reference", "desc", this.IdFournisseur, []).subscribe(res => {
      this.produits = res.list;
      this.totalPage = res.totalPages;
      this.loadingFinished = true;
    });
  }

  // Recherche des articles dans popup
  searchProduit() {
    this.page = 1;
    this.produits = [];
    this.getProduits();
  }

  // On cas de scroll dans popup des articles
  onScroll() {
    if (this.totalPage != this.page) {
      this.page++;
      this.getProduits();
    }
  }

  addTmpArticle(index, value) {

    if (value != '') {
      this.produitsTmp.unshift({
        data: this.produits[index],
        qte: value != null ? parseInt(value) : 1,
        remise: 0,
        type: 0,

      });
      this.produits.splice(index, 1);
    }
  }

  changeQuantite(index, value, changed) {
    let produit = this.produitsTmp[index];
    if (value != null) produit.qte += value;
    if (changed != null && changed != '') produit.qte = parseInt(changed);
    if (produit.qte <= 0) produit.qte = 1;
  }

  // C'est pour supprimer l'article selectioné sur le popup
  removeTmpArticle(index) {

    this.produits.unshift(this.produitsTmp[index].data as Produit);
    this.produitsTmp.splice(index, 1);
    // jQuery("#selectProduits").modal("hide");
    // this.initialization;
  }

  initialization() {
    this.produitsTmp = [];
    // this.lotsTmp = [];
    this.search = '';
    this.page = 1;

  }

  addProduits() {

    this.ONAdd.emit(this.produitsTmp);
  }
  qte(produit) {

    return produit.qte == undefined ? 0 : produit.qte
  }


}
