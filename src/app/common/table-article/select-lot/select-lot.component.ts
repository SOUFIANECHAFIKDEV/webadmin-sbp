import { Component, EventEmitter, Input, Output, OnInit, OnChanges, Inject } from '@angular/core';
import { LotsService } from 'app/services/lots/lots.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Lots, LotProduits } from 'app/Models/Entities/Lots';
import { Produit } from 'app/Models/Entities/Produit';
import { ArticleType } from 'app/Models/article-type';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
declare var toastr: any;
@Component({
  selector: 'select-lot',
  templateUrl: './select-lot.component.html',
  styleUrls: ['./select-lot.component.scss']
})
export class SelectLotComponent implements OnInit {

  selected: { data: (Produit | Lots), qte: number, type: number, remise: number }[] = []; // les Produit choisi dans popup

  // selected: Lots[] = [];
  search = ""; // zone de recherche
  page = 1; // Current page des
  lots: Lots[] = [];
  totalPage = 1; // total des pages
  loadingFinished = false; // si la liste chargé
  lotsTmp: { data: (Produit | Lots), qte: number, type: number, remise: number }[] = []; // les Produit choisi dans popup
  articleType: ArticleType = new ArticleType();


  constructor(
    private lotsService: LotsService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<SelectLotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isAvoir: boolean }
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getlots();
    console.log(this.data.isAvoir)
  }

  getlots() {
    this.lotsTmp = [];
    this.lotsService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "reference", "desc").subscribe(res => {
      this.lots = res.list.filter((l) => !this.selected.some(e => e.data.id === l.id));
      console.log(res.list.filter((l) => !this.selected.some(e => e.data.id === l.id)));
      this.totalPage = res.totalPages;
      this.loadingFinished = true;
    });
  }

  checkElement(index, value) {
    this.selected.unshift({
      data: !this.data.isAvoir ? this.lots[index] : this.formatLotIsAvoir(this.lots[index]),
      qte: value != null ? parseInt(value) : 1,
      type: this.articleType.lot,
      remise: 0
    }
    );
    this.lots.splice(index, 1);
  }

  IncheckElement(index) {
    let lotselected = !this.data.isAvoir ? this.selected[index].data : this.formatLotIsAvoir(this.selected[index].data);
    this.lots.unshift(lotselected as any);
    this.selected.splice(index, 1);
  }


  // On cas de scroll dans popup des lots
  onScrollLots() {
    if (this.totalPage != this.page) {
      this.page++;
      this.getlots();
    }
  }

  // C'est pour change la quantite d'un lot
  changeQuantiteLot(index, value, changed) {
    let lot = this.selected[index];
    if (value != null) lot.qte += value;
    if (changed != null && changed != '') lot.qte = parseInt(changed);
    if (lot.qte <= 0) lot.qte = 1;
  }


  //Pour avoir * (-1)
  formatLotIsAvoir(lots: Lots) {
    debugger
    if (this.data.isAvoir == true) {
      lots.lotProduits = lots.lotProduits.map(x => {
        {
          x.idProduitNavigation.prixHt = x.idProduitNavigation.prixHt * (-1),
            x.idProduitNavigation.cout_materiel = x.idProduitNavigation.cout_materiel * (-1);
          x.idProduitNavigation.cout_vente = x.idProduitNavigation.cout_vente * (-1);
        } return x;
      })
      return lots;
    }
  }

  // Recherche des articles dans popup
  searchLots() {
    this.page = 1;
    this.lots = [];
    this.getlots();

  }
  save() {
    debugger
    if (this.selected.length == 0) {
      toastr.warning('text.serveur', '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    } else {
      console.log(this.selected)
      this.dialogRef.close(this.selected);
    }
  }
}