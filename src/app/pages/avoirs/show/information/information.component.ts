import { Component, OnInit, Input } from '@angular/core';
import { Prestation } from 'app/Models/Entities/Prestation';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { Avoir } from 'app/Models/Entities/Avoir';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Client } from 'app/Models/Entities/Client';
import { Adresse } from 'app/Models/Entities/Adresse';
import { TranslateService } from '@ngx-translate/core';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'avoir-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})

export class InformationComponent implements OnInit {

  @Input("avoir") avoir: Avoir
  @Input('client') client: Client;

  @Input('articles') articles = [];
  statutAvoir: typeof StatutAvoir = StatutAvoir
  statutFacture: typeof StatutFacture = StatutFacture

  editorConfig: AngularEditorConfig = {
    editable: false,
    spellcheck: false,
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false
  }

  base64 = null;
  constructor(
    private translate: TranslateService,
    private avoirService: AvoirService,
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
    this.avoirService.generatePDF(id).subscribe(res => {
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

    this.avoirService.generatePDF(id).subscribe(res => {
      // Get time stamp for fileName.
      var stamp = new Date().getTime();

      // file type
      var fileType = 'application/pdf';

      // file extension
      var extension = 'pdf';

      AppSettings.downloadBase64("," + res, "AV_" + stamp + "." + extension, fileType, extension)

    });
  }


}
