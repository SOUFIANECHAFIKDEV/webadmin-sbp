import { Component, OnInit, Input } from '@angular/core';
import { BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';
import { Chantier } from 'app/Models/Entities/Chantier';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { Router } from '@angular/router';
import { BonCommandeFournisseurService } from 'app/services/bonCommandeFournisseur/bonCommandeFournisseur.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { Depense } from 'app/Models/Entities/depense';
import { PrestationInterventionModel } from 'app/Models/PrestationInterventionModel';
import { DepenseState, CreateDepense } from '../../depenseState';
declare var jQuery: any;
declare var toastr: any;
@Component({
  selector: 'app-depense-groupe-bcf',
  templateUrl: './depense-groupe-bcf.component.html',
  styleUrls: ['./depense-groupe-bcf.component.scss']
})
export class DepenseGroupeBCFComponent implements OnInit {

  bonCommandeFournisseurUnSelected: BonCommandeFournisseur[] = []
  bonCommandeFournisseur: BonCommandeFournisseur[] = []
  idChantier;
  idFournisseur;
  finished = true;
  search = "";
  page = 1;
  totalPage = 0;
  chantier: Chantier[] = []
  chantierSelected: Chantier[] = []
  @Input("fournisseurs") fournisseurs: Fournisseur[] = []
  fournisseurSelected: Fournisseur[] = []
  @Input("chantiers") chantiers: Chantier[] = [];

  constructor(
    private router: Router,
    private bonCommandeFournisseurService: BonCommandeFournisseurService,
    private translate: TranslateService,
  ) { }
  ngOnInit() {
  }
  /**
   * Choisir Chantier
   */
  getBCFByChantier(info: { idChantier: number, idFournisseur: number }): void {

    this.idChantier = info.idChantier;
    this.idFournisseur = info.idFournisseur;
    this.bonCommandeFournisseurUnSelected = []
    this.bonCommandeFournisseur = []
    jQuery("#depenseGroupee").modal("show");
    this.bonCommandeFournisseurList();
  }
  /**
   * Récupérer la liste des bon des commandes Fournisseur
   */
  bonCommandeFournisseurList() {

    this.bonCommandeFournisseurService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "BonCommandeFournisseur", "asc", null, null, this.idChantier, this.idFournisseur, StatutBonCommandeFournisseur.Encours)
      .subscribe((res) => {
        var listBonCommandeFournisseurs = res.list.filter(value => this.bonCommandeFournisseurUnSelected.filter(x => x.id == value.id).length == 0);
        this.totalPage = res.totalPages;
        listBonCommandeFournisseurs.forEach(BCFournisseur => {
          this.bonCommandeFournisseurUnSelected.push(BCFournisseur)
        })
      });
  }
  /**
   * On cas de scroll dans popup de BCFournisseur
   */
  onScroll() {
    this.page++;
    this.bonCommandeFournisseurList();
    if (this.totalPage = this.page) {
      this.finished = true;
    }
  }

  /**
   * Recherche des BCFournisseur dans popup
   */
  searchBCF() {
    this.page = 1;
    this.bonCommandeFournisseurUnSelected = [];
    this.bonCommandeFournisseurList();
  }
  /**
    * Selectioné bon commande Fournisseur
    */
  addBonCommandeFournisseur(index) {
    let bonCommadeFournisseur = this.bonCommandeFournisseurUnSelected[index]
    this.bonCommandeFournisseur.push(bonCommadeFournisseur)
    this.bonCommandeFournisseurUnSelected.splice(index, 1)
  }
  /**
   * Déselectioné bon commande Fournisseur
   */
  removeBonCommandeFournisseur(index) {
    let bonCommadeFournisseur = this.bonCommandeFournisseur[index]
    this.bonCommandeFournisseurUnSelected.push(bonCommadeFournisseur)
    this.bonCommandeFournisseur.splice(index, 1)
  }
  /**
   * save Bon Commande Fournisseur
   */
  saveBonCommandeFournisseur() {
    if (this.bonCommandeFournisseur.length == 0) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.SelectionneBonCommandeRequired, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      })
    }
    if (this.bonCommandeFournisseur.length > 0) {
      let depense = new Depense
      let articles: PrestationInterventionModel[] = [];
      let prestations: any
      let idsBonCommandeFournisseur = [];
      this.bonCommandeFournisseur.forEach(bonCommandeFournisseur => {
        idsBonCommandeFournisseur.push(bonCommandeFournisseur.id)
        prestations = JSON.parse(bonCommandeFournisseur.articles)
        prestations.forEach(element => articles.push(element));
        depense.idChantier = bonCommandeFournisseur.idChantier
        depense.chantier = bonCommandeFournisseur.chantier
        depense.idFournisseur = bonCommandeFournisseur.idFournisseur
      })
      depense.prestations = JSON.stringify(articles)
      depense.tva = null;
      DepenseState.depense = depense;
      DepenseState.idBonCommandeFournisseur = idsBonCommandeFournisseur
      this.router.navigate(['/depense/ajouter/', CreateDepense.Bon_Commande_Fournisseur]);
      jQuery("#depenseGroupee").modal("hide");
      (articles);
    }
  }

}
