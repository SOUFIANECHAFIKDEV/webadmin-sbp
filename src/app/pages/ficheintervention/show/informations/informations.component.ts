import { Component, OnInit, Input, OnChanges, Inject } from '@angular/core';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { Client } from 'app/Models/Entities/Client';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { DOCUMENT } from '@angular/common';
import { User } from 'app/Models/Entities/User';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { TranslateService } from '@ngx-translate/core';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Adresse } from 'app/Models/Entities/Adresse';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
export declare var swal: any;
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'app-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit, OnChanges {
  @Input('ficheIntervention') ficheIntervention: FicheIntervention;
  @Input('client') client: Client;

  adresseFacturation: Adresse;
  usersToDispaly
  techniciens: User[] = [];
  prestations: any;
  // statutDevis: typeof StatutDevis = StatutDevis;
  statutficheIntervention: typeof StatutFicheIntervention = StatutFicheIntervention
  statutFacture: typeof StatutFacture = StatutFacture
  labels: any;
  statuts: { id: number, label: string, color: string }[];
  designation
  base64 = null;
  constructor(private ficheInterventionService: FicheInterventionService, private chantierService: ChantierService, private translate: TranslateService, @Inject(DOCUMENT) private document: any) {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(text => {
      this.labels = text;
    });
  }
  emitter
  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });

    if (this.ficheIntervention != undefined) {
      this.adresseFacturation = JSON.parse(this.ficheIntervention.adresseIntervention);
      this.techniciens = this.ficheIntervention.interventionTechnicien.map(res => {
        return res.idTechnicienNavigation;
      });
      this.prestations = this.selectArticles(JSON.parse(this.ficheIntervention.prestations));
      // this.prestations = this.ficheIntervention.prestations;

    }
  }
  ngOnChanges() {

    if (this.ficheIntervention != undefined) {
      try {
        this.adresseFacturation = JSON.parse(this.ficheIntervention.adresseIntervention);
      } catch (ex) { }
      this.techniciens = this.ficheIntervention.interventionTechnicien.map(res => {
        return res.idTechnicienNavigation;
      });
      this.prestations = this.selectArticles(JSON.parse(this.ficheIntervention.prestations));
      //  this.prestations = this.ficheIntervention.prestations;

    }
    this.getLabelleByStatut(this.ficheIntervention.status);
  }

  // navigateTo(when) {

  //   switch (when) {
  //     case 'client':
  //       const origin = this.document.location.origin.replace("http", "https");;
  //       const url = `${origin}/clients/detail/${this.client.id}`;
  //       window.open(url, '_blank');
  //       break;
  //   }
  //}
  compareDate(date) {
    //Note: 00 is month i.e. January  
    var dateOne = new Date(); //Year, Month, Date  
    var datefin = new Date(date); //Year, Month, Date  
    if (dateOne > datefin) {
      return true;
    } else {
      return false;
    }
  }
  getLabelleByStatut(statut) {

    switch (statut) {
      case this.statutficheIntervention.Brouillon:
        return this.labels.brouillon;
        break;
      case this.statutficheIntervention.Annulee:
        return this.labels.annulee;
        break;
      case this.statutficheIntervention.Planifiee:
        return this.labels.planifiee;
        break;
      case this.statutficheIntervention.Realisee:
        return this.labels.realisee;
        break;
      case this.statutficheIntervention.Facturee:
        return this.labels.facturee;
        break;
      // 
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

  generatePDFBase64(id: number): void {
    this.ficheInterventionService.generatePDF(id).subscribe(res => {
      this.base64 = res;
    }, err => {
      jQuery("#PdfView").modal("hide");
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });;
  }
  // Generate pdf
  generatePDF(id) {

    this.ficheInterventionService.generatePDF(id).subscribe(res => {
      // Get time stamp for fileName.
      var stamp = new Date().getTime();

      // file type
      var fileType = 'application/pdf';

      // file extension
      var extension = 'pdf';

      AppSettings.downloadBase64(',' + res, 'FI_' + stamp + '.' + extension, fileType, extension);

    });
  }
}


