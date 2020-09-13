import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Devis } from 'app/Models/Entities/Devis';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { DevisService } from 'app/services/devis/devis.service';
export declare var swal: any;
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'devis-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit {
  @Input('devis') devis: Devis;
  @Input('articles') articles = [];

  @Input('addType') addType: string = 'minimaliste';
  //@Output('ChangeStatus') changeStatus = new EventEmitter();
  @Output('ONChangeStatutDevis') ONChangeStatutDevis = new EventEmitter();


  statutDevis: typeof StatutDevis = StatutDevis;
  statutFacture: typeof StatutFacture = StatutFacture;
  statutBonCommandeFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur
  typeFacture: typeof TypeFacture = TypeFacture;
  @Input('articlesInfo') articlesInfo;
  labels: any = null;
  id: number;
  base64 = null;
  statuts: { id: number, label: string, color: string }[];
  constructor(private translate: TranslateService, private devisService: DevisService, ) {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(text => {
      this.labels = text;
    });
  }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });

  }

  jsonParse(data) {
    try {
      return JSON.parse(data);
    } catch (err) {

    }
  }
  getLabelleByStatut(statut) {
    if (this.labels == null) {
      return
    }
    switch (statut) {
      case this.statutDevis.EnAttente:
        return this.labels.enattente;
        break;
      case this.statutDevis.Acceptee:
        return this.labels.acceptee;
        break;
      case this.statutDevis.Annulee:
        return this.labels.annulee;
        break;
      case this.statutDevis.NonAcceptee:
        return this.labels.nonacceptee;
        break;
      case this.statutDevis.Facture:
        return this.labels.facture;
        break;
      // 
    }
  }
  /** changer le statut du chantier  */
  changeStatutDevis(changeTostatut: StatutDevis) {
    this.ONChangeStatutDevis.emit(changeTostatut);
  }

  generatePDFBase64(id: number): void {
    this.devisService.generatePDF(id).subscribe(res => {
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

    this.devisService.generatePDF(id).subscribe(res => {
      // Get time stamp for fileName.
      var stamp = new Date().getTime();

      // file type
      var fileType = 'application/pdf';

      // file extension
      var extension = 'pdf';

      AppSettings.downloadBase64(',' + res, 'DV_' + stamp + '.' + extension, fileType, extension);

    });
  }

}
