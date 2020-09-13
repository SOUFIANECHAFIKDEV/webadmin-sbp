import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { Facture } from 'app/Models/Entities/Facture';
import { CreateFacture } from 'app/Enums/CreateFacture.Enum';
import { TranslateService } from '@ngx-translate/core';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { Chantier } from 'app/Models/Entities/Chantier';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { FactureState } from '../../facture-state';
import { PrestationInterventionModel } from 'app/Models/PrestationInterventionModel';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { Router } from '@angular/router';
import { infoClientModel } from 'app/Models/Entities/Avoir';
declare var jQuery: any;
declare var toastr: any;
@Component({
  selector: 'app-facturation-groupe-ft',
  templateUrl: './facturation-groupe-ft.component.html',
  styleUrls: ['./facturation-groupe-ft.component.scss']
})
export class FacturationGroupeFTComponent {

  ficheInterventionUnselected: FicheIntervention[] = []
  fichesIntervention: FicheIntervention[] = []
  idChantier;
  finished = true;
  search = ""
  page = 1; // Current page de fiche intervention
  totalPage = 0 // total pages
  @Input("chantiers") chantiers: Chantier[] = [];
  chantierSelected: Chantier[] = []


  constructor(
    private router: Router,
    private ficheInterventionService: FicheInterventionService,
    private translate: TranslateService,
  ) { }


  //choisirChantier(idChantier) {
  choisirChantier(info: { idChantier: number, idFournisseur: number }): void {
    this.idChantier = info.idChantier;
    this.ficheInterventionUnselected = []
    this.fichesIntervention = []
    jQuery("#factureGroupee").modal("show");
    this.ficheinterventionlist();

  }
  // Récupérure la listes des fiches intervention
  ficheinterventionlist() {
    this.finished = false;
    this.ficheInterventionService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "Intervention", "asc", StatutFicheIntervention.Realisee, null, null, this.idChantier)
      .subscribe((res) => {

        var listFichesIntervention = res.list.filter(value => this.fichesIntervention.filter(x => x.id == value.id).length == 0);
        this.totalPage = res.totalPages;
        listFichesIntervention.forEach(fiche => {
          this.ficheInterventionUnselected.push(fiche)
        })
        this.finished = true;
      });

  }

  // On cas de scroll dans popup des ft
  onScroll() {

    this.page++;
    this.ficheinterventionlist();
    if (this.totalPage == this.page) {
      this.finished = true;
    }
  }

  // Recherche des ft dans popup
  searchFT() {
    this.page = 1;
    this.ficheInterventionUnselected = [];
    this.ficheinterventionlist();
  }

  // selectioné fiche intervention

  addFicheIntervention(index) {
    let ficheIntervention = this.ficheInterventionUnselected[index]
    this.fichesIntervention.push(ficheIntervention)
    this.ficheInterventionUnselected.splice(index, 1)
  }
  // désélectioné fiche intervention
  removeFicheIntervention(index) {
    let ficheIntervention = this.fichesIntervention[index]
    this.ficheInterventionUnselected.push(ficheIntervention)
    this.fichesIntervention.splice(index, 1)

  }


  savefiche() {
    debugger

    if (this.fichesIntervention.length == 0) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.SelectinneFicheRequired, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      })
    }
    if (this.fichesIntervention.length > 0) {
      let facture = new Facture
      let articles: PrestationInterventionModel[] = [];
      let prestations: any
      let idsFicheIntervention = [];
      this.fichesIntervention.forEach(ficheIntervention => {
        idsFicheIntervention.push(ficheIntervention.id)
        prestations = this.selectArticles(JSON.parse(ficheIntervention.prestations));

        prestations.forEach(element => articles.push(element));
        facture.idChantier = ficheIntervention.idChantier
        facture.chantier = ficheIntervention.chantier
        facture.idClient = ficheIntervention.chantier.client.id
        let infoClient: infoClientModel = new infoClientModel();
        infoClient.codeClient = ficheIntervention.chantier.client.codeclient;
        infoClient.nom = ficheIntervention.chantier.client.nom;
        const adresseFacturation = JSON.parse(ficheIntervention.chantier.client.adresses)
        infoClient.adresseFacturation = adresseFacturation.filter(A => A.default == true)[0];
        facture.infoClient = JSON.stringify(infoClient);
      });
      facture.prestations = JSON.stringify(articles);
      facture.prorata = 0;
      facture.puc = 0;
      facture.remise = 0;
      facture.retenueGarantie = 0;
      facture.delaiGarantie = null;
      facture.typeRemise = "€";
      facture.tva = null;
      facture.tvaGlobal = null;
      FactureState.facture = facture;
      FactureState.idFicheTravail = idsFicheIntervention
      this.router.navigate(['/factures/ajouter', CreateFacture.FICHE_INTERVENTION]);
      jQuery("#factureGroupee").modal("hide");
      (articles);
    }
  }

  selectArticles(articles) {
    debugger
    if ((articles as any).prestation != undefined) {
      let prestation = JSON.parse((articles as any).prestation);
      if (prestation.prestation != undefined) {
        prestation = JSON.parse(prestation.prestation);
      }
      if (prestation.prestation != undefined) {
        prestation = JSON.parse(prestation.prestation);
      }
      return prestation;
    } else {
      return articles;
    }
  }


}
