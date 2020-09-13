import { Component, OnInit } from '@angular/core';
import { Adresse } from 'app/Models/Entities/Adresse';
import { Client } from 'app/Models/Entities/Client';
import { VisiteMaintenance } from 'app/Models/Entities/VisiteMaintenance';
import { StatutVisiteMaintenance } from 'app/Enums/StatutVisiteMaintenance';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
declare var toastr: any;
export declare var swal: any;

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {
  dateLang: any;
  processing: boolean = false;
  adresses: Adresse[] = [];
  client: Client = new Client();
  visiteMaintenance: VisiteMaintenance = new VisiteMaintenance();
  statutVisiteMaintenance: typeof StatutVisiteMaintenance = StatutVisiteMaintenance;
  id
  labels: any = null;
  statuts: { id: number; label: string; color: string }[];

  constructor(
    private translate: TranslateService,
    private visiteMaintenanceService: VisiteMaintenanceService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit() {
    this.processing = true;
    this.selectLanguage();
    this.translate.get("labels").subscribe(text => {
      this.labels = text;
    });
    this.route.params.subscribe(async params => {
      debugger
      this.id = params['id'];
      this.translate.get('statuts').subscribe((statuts: { id: number; label: string; color: string }[]) => this.statuts = statuts);
      await this.refresh();
      this.processing = false;
    });
    this.processing = false;
  }
  // Refresh facture aprés l'ajout de paiement ou init component
  refresh(): Promise<void> {
    return new Promise((reslove, reject) => {
      this.visiteMaintenanceService.Get(this.id).subscribe(async res => {
        this.visiteMaintenance = res;
      }, err => {

      }, () => {
        reslove();
      });
    });
  }

  /** --------------------------------------------------------
  @description définir la langue utilisée dans le composant
  --------------------------------------------------------*/
  selectLanguage(): void {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
  }

  changeStatut(statut: StatutVisiteMaintenance) {
    debugger
    this.visiteMaintenanceService.changeStatut({ idVisiteMaintenance: this.visiteMaintenance.id, statutVisiteMaintenance: statut }).subscribe(res => {
      if (res) {
        this.refresh();
      }
    })
  }

  getLabelleByStatut(statut: StatutVisiteMaintenance) {

    if (this.labels == null) {
      return
    }
    switch (statut) {
      case this.statutVisiteMaintenance.APlanifier:
        return this.labels.aplanifier;
        break;
      case this.statutVisiteMaintenance.Planifier:
        return this.labels.planifier;
        break;
      case this.statutVisiteMaintenance.Annule:
        return this.labels.annulee;
        break;
      case this.statutVisiteMaintenance.Fait:
        return this.labels.fait;
        break;
      case this.statutVisiteMaintenance.NonFait:
        return this.labels.nonfait;
        break;
      // 
    }
  }

}
