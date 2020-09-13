import { Component, OnInit, Input } from '@angular/core';
import { Facture } from 'app/Models/Entities/Facture';
import { Prestation } from 'app/Models/Entities/Prestation';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { Client } from 'app/Models/Entities/Client';
import { Adresse } from 'app/Models/Entities/Adresse';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { TranslateService } from '@ngx-translate/core';
import { FactureService } from 'app/services/facture/facture.service';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'facture-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
})
export class InformationComponent {
  @Input('facture') facture: Facture;
  @Input('client') client: Client;
  @Input('articles') articles = [];

  typeFacture: typeof TypeFacture = TypeFacture
  statutFacture: typeof StatutFacture = StatutFacture;
  statutAvoir: typeof StatutAvoir = StatutAvoir
  statutDevis: typeof StatutDevis = StatutDevis
  adresseFacturation: Adresse
  editorConfig: AngularEditorConfig = {
    editable: false,
    spellcheck: false,
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false,
  }
  base64 = null;
  constructor(
    private translate: TranslateService,
    private factureService: FactureService,
    private route: ActivatedRoute, ) {

  }
  async ngOnInit() {

    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  getAdresseDesignation(data): string {
    try {
      const adresses: Adresse[] = JSON.parse(data)
      const adresse = adresses.filter(x => x.default);
      return adresse.length != 0 ? adresse[0].designation : '';
    } catch (err) {
      return '';
    }
  }

  generatePDFBase64(id: number): void {
    this.factureService.generatePDF(id).subscribe(res => {
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

    this.factureService.generatePDF(id).subscribe(res => {
      // Get time stamp for fileName.
      var stamp = new Date().getTime();

      // file type
      var fileType = 'application/pdf';

      // file extension
      var extension = 'pdf';

      AppSettings.downloadBase64(',' + res, 'FA_' + stamp + '.' + extension, fileType, extension);

    });
  }

}
