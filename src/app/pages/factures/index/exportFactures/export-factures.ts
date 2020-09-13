import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
// import { AppSettings } from 'app/app-settings/app-settings';
// import { FicheTravailService } from 'app/services/ficheTravail/fiche-travail.service';
// import { StatutFicheTravail } from 'app/Enums/StatutFicheTravail.enum';
// import { FicheTravail } from 'app/Models/Entities/FicheTravail';
// import { Facture } from 'app/Models/Entities/Facture';

import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Chantier } from 'app/Models/Entities/Chantier';


declare var jQuery: any;
declare var toastr: any;

@Component({
  selector: 'app-export-factures',
  templateUrl: './export-factures.html',
  styleUrls: ['./export-factures.scss']
})
export class exportFacturesComponent implements OnInit {
  dateLang;
  dataTablesLang;
  typeExport: number;
  DateDebut: Date;
  DateFin: Date;

  IdChantier
  @Input("clients") clients: Client[] = [];
  IdClient

  ExporterFacturesChantier: boolean = true;

  @Output('startExport') startExport = new EventEmitter();
  constructor(
    private translate: TranslateService,


  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
  }
  getDataTablesTrans() {
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
    });
  }




  export() {
    // if (!this.validate()) return;
    if (this.typeExport == 1) {
      let params = {
        //  IdChantier: this.IdChantier == undefined ? -1 : this.IdChantier,
        IdClient: this.IdClient == undefined ? -1 : this.IdClient,
        DateDebut: this.DateDebut,
        DateFin: this.DateFin,
        ExporterFacturesChantier: this.ExporterFacturesChantier
      };
      this.startExport.emit({
        type: 'factureParPeriod',
        params
      });
    }

    if (this.typeExport == 2) {
      let params = {
        // IdChantier: this.IdChantier == undefined ? -1 : this.IdChantier,
        IdClient: this.IdClient == undefined ? -1 : this.IdClient,
        DateDebut: this.DateDebut,
        DateFin: this.DateFin,
        ExporterFacturesChantier: this.ExporterFacturesChantier
      };
      this.startExport.emit({
        type: 'relanceFacture',
        params
      });
    }



    jQuery("#exportFactures").modal("hide");
    this.typeExport = null;
    this.DateDebut = null;
    this.DateFin = null;
    this.IdClient = null;
  }

  validate() {
    if (this.typeExport == 0 || this.typeExport == undefined) {
      return true;
      // return false;
    }
    var DateDebut = new Date(this.DateDebut);
    var DateFin = new Date(this.DateFin);

    if (this.typeExport == 0 && (DateDebut > DateFin)) {
      return true;
    }
    if (this.typeExport == 1 && ((this.DateDebut == undefined || this.DateFin == undefined))) {
      return true;
      // return false;
    }

    // return true;
    return false;
  }
}
