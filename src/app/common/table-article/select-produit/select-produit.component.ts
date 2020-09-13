import { Component, OnChanges, Input, Output, EventEmitter, OnInit, Inject } from '@angular/core';
import { ProduitService } from 'app/services/produit/produit.service';
import { Produit } from 'app/Models/Entities/Produit';
import { AppSettings } from 'app/app-settings/app-settings';
import { Lots } from 'app/Models/Entities/Lots';
import { ArticleType } from 'app/Models/article-type';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
declare var toastr: any;
declare var jQuery: any;
@Component({
    selector: 'select-produit',
    templateUrl: './select-produit.component.html',
    styleUrls: ['./select-produit.component.scss']
})
export class SelectProduitComponent implements OnInit {
    search = ""; // zone de recherche
    page = 1; // Current page des
    produits: Produit[] = [];
    // selected: Produit[] = [];
    selected: { data: (Produit | Lots), qte: number, type: number, remise: number }[] = []; // les Produit choisi dans popup

    loadingFinished = false; // si la liste chargé
    totalPage = 1; // total des pages
    articleType: ArticleType = new ArticleType();

    constructor(private produitService: ProduitService,
        private translate: TranslateService,
        public dialogRef: MatDialogRef<SelectProduitComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { isAvoir: boolean, isIntervention: boolean }) { }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.getProduits();
    }

    Categorie = null;
    //récuperer la liste des produits
    getProduits() {
        if (this.data.isIntervention == true) {
            this.Categorie = "Service "
        }
        this.selected = [];
        this.loadingFinished = false;
        this.produitService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "reference", "desc", null, [], this.Categorie).subscribe(res => {
            // this.produits = res.list;
            this.produits = res.list.filter((l) => !this.selected.some(e => e.data.id === l.id));
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

    checkElement(index, value) {
        this.selected.unshift({
            data: !this.data.isAvoir ? this.produits[index] as Produit : this.formatProduitIsAvoir(this.produits[index] as Produit),
            qte: value != null ? parseInt(value) : 1,
            type: this.articleType.produit,
            remise: 0
        });
        this.produits.splice(index, 1);
    }

    IncheckElement(index) {
        let produitSelected = !this.data.isAvoir ? this.selected[index].data : this.formatProduitIsAvoir(this.selected[index].data as Produit);
        this.produits.unshift(produitSelected as any);
        this.selected.splice(index, 1);
    }

    formatProduitIsAvoir(produits: Produit) {
        if (this.data.isAvoir == true) {
            produits.prixHt = produits.prixHt * (-1)
            produits.cout_materiel = produits.cout_materiel * (-1)
            produits.cout_vente = produits.cout_vente * (-1)
        }
        return produits;
    }

    changeQuantite(index, value, changed) {
        let produit = this.selected[index];
        if (value != null) produit.qte += value;
        if (changed != null && changed != '') produit.qte = parseInt(changed);
        if (produit.qte <= 0) produit.qte = 1;
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