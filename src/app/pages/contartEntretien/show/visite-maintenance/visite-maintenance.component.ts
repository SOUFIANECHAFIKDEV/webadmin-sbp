import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { ContratEntretien } from 'app/Models/Entities/ContratEntretien';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { VisiteMaintenance, VisiteMaintenanceViewModel } from 'app/Models/Entities/VisiteMaintenance';
//mport { groupBy } from 'lodash-es'
import * as _ from 'lodash';
import { sortBy } from 'lodash';
import { StatutVisiteMaintenance } from 'app/Enums/StatutVisiteMaintenance';
import { moisEnum } from 'app/common/gamme-maintenance-equipement/sheard/enums/mois.enum';
import { MenuItem } from 'app/custom-module/primeng/api';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { FicheInterventionMaintenance } from 'app/Models/Entities/FicheInterventionMaintenance';
import { GammeVisiteMaintenanceEquipementModel } from 'app/Models/GammeVisiteMaintenanceEquipementModel';
// import { FicheInterventionMaintenanceState } from 'app/pages/ficheInterventionMaintenance/ficheInterventionMaintenance-state';
import { FicheInterventionMaintenanceService } from 'app/services/ficheInterventionMaintenance/fiche-intervention-maintenance.service';
import { Router } from '@angular/router';
import { CreateFicheInterventionMaintenance } from 'app/Enums/CreateFicheInterventionMaintenance.Enum';
declare var toastr: any;

declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'app-visite-maintenance',
  templateUrl: './visite-maintenance.component.html',
  styleUrls: ['./visite-maintenance.component.scss']
})
export class VisiteMaintenanceComponent implements OnInit, OnChanges {
  @Output('OnRefresh') refresh = new EventEmitter();
  @Input("contratEntretien") contratEntretien: ContratEntretien

  visitesMaintenances: VisiteMaintenanceViewModel[] = [];
  statutVisiteMaintenance: typeof StatutVisiteMaintenance = StatutVisiteMaintenance;
  moisEnum: typeof moisEnum = moisEnum;
  labels: any = null;
  actionsItems: MenuItem[] = [];
  constructor(private translate: TranslateService,
    private visiteMaintenanceService: VisiteMaintenanceService,
    private router: Router) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(text => {
      this.labels = text;
    });
  }
  ngOnChanges() {
    const visiteMaintenance = this.contratEntretien.visiteMaintenance;
    const states: VisiteMaintenanceViewModel = _.groupBy(visiteMaintenance, 'annee')
    this.visitesMaintenances = [];
    for (let key in states) {
      this.visitesMaintenances.push({
        year: parseInt(key),
        visitesMaintenances: states[key]
      });
    }
  }

  voirDetails(visitesMaintenances: VisiteMaintenance[], mois: number) {
    if (visitesMaintenances == undefined) {
      return true;
    }
    const { id } = this.getVisiteMaintenance(visitesMaintenances, mois);
    this.router.navigate(['/visitesMaintenance/detail/', id])
  }
  getVisiteMaintenence(id): Promise<VisiteMaintenance> {
    return new Promise((resolve, reject) => {
      this.visiteMaintenanceService.Get(id).subscribe(
        res => {
          resolve(res);
        },
        err => {
          this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
          });
        }
      );
    });
  }
  getConditionActions(typeAction, visitesMaintenances: VisiteMaintenance[], mois: number) {
    debugger
    if (visitesMaintenances == undefined) {
      return true;
    }
    const visiteMaintenance = this.getVisiteMaintenance(visitesMaintenances, mois);
    switch (typeAction) {
      case 'annelee':
        return (visiteMaintenance.statut == this.statutVisiteMaintenance.APlanifier) ? true : false;
      case 'aplanifier':
        return (visiteMaintenance.statut == this.statutVisiteMaintenance.Annule) ? true : false;

    }
  }


  changeStatutVisiteMaintenance(statut: StatutVisiteMaintenance, visitesMaintenances: VisiteMaintenance[], mois: number) {
    if (visitesMaintenances == undefined) {
      return true;
    }
    const visiteMaintenance = this.getVisiteMaintenance(visitesMaintenances, mois);
    this.translate.get(this.getTransalteLocationRequest(statut)).subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: "warning",
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: "",
            closeModal: false
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {

          this.visiteMaintenanceService.changeStatut({ idVisiteMaintenance: visiteMaintenance.id, statutVisiteMaintenance: statut }).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.refresh.emit('1');
            } else {
              swal(text.ImpossibleDeSuppression, "", "error");
            }
          });
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
  /**
   * @summary fonction générique s'utiliser dans la fonction du changement du statut d'un visite maintenance 
   * @todo déterminer la requête pour récupérer la traduction à partirdu ficher json de traduction
   * @param statut le statut du chantier qui nous voulons récupérer leur traduction
   */
  getTransalteLocationRequest(statut: StatutVisiteMaintenance): string {
    debugger
    (statut)
    let StatusLabel: string = this.statutVisiteMaintenance[statut].toLowerCase();
    (StatusLabel)
    console.log(StatusLabel)
    return `changeStatutVisiteMaintenance.${StatusLabel}`;
  }

  // async createFicheIntervention(visitesMaintenances: VisiteMaintenance[], mois: number) {
  //   debugger
  //   const list = visitesMaintenances.filter(x => x.mois == mois);
  //   let visiteMaintenance = list.length == 0 ? null : list[0]
  //   let visite = await this.getVisiteMaintenence(visiteMaintenance.id)
  //   let ficheInterventionMaintenace = this.transfertVisiteMaintenanceToInterventionMaintenece(visite);
  //   FicheInterventionMaintenanceState.ficheInterventionMaintenance = ficheInterventionMaintenace;
  //   FicheInterventionMaintenanceState.idVisiteMaintenance = visite.id;
  //   this.router.navigate(['/ficheinterventionmaintenance/ajouter', CreateFicheInterventionMaintenance.DUPLIQUER])}

  //   transfertVisiteMaintenanceToInterventionMaintenece(visitesMaintenances: VisiteMaintenance) {
  //     let ficheInterventionMaintenance = new FicheInterventionMaintenance();

  //     ficheInterventionMaintenance.idVisiteMaintenance = visitesMaintenances.id;
  //     ficheInterventionMaintenance.visiteMaintenance = visitesMaintenances;
  //     console.log("co", ficheInterventionMaintenance.visiteMaintenance)
  //     return ficheInterventionMaintenance
  //  }


  getStatutByMonth(visitesMaintenances: VisiteMaintenance[], mois: number) {
    debugger
    const visitesMaintenance = this.getVisiteMaintenance(visitesMaintenances, mois);
    if (visitesMaintenance != null) {
      return this.getLabelleByStatut(visitesMaintenance.statut);
    } else {
      return null;
    }

  }
  conditionsDropdownMenu(visitesMaintenances: VisiteMaintenance[], mois: number) {
    const visitesMaintenance = this.getVisiteMaintenance(visitesMaintenances, mois);
    if (visitesMaintenance != null) {
      return this.getConditionByStatut(visitesMaintenance.statut);
    } else {
      return null;
    }



  }
  getConditionByStatut(statut: StatutVisiteMaintenance) {
    switch (statut) {
      case this.statutVisiteMaintenance.APlanifier:
        return true;
        break;
      case this.statutVisiteMaintenance.Planifier:
        return false;
        break;
      case this.statutVisiteMaintenance.Annule:
        return true;
        break;
      case this.statutVisiteMaintenance.Fait:
        return false;
        break;
      case this.statutVisiteMaintenance.NonFait:
        return false;
        break;
      // 
    }
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
  getVisiteMaintenance(visitesMaintenances: VisiteMaintenance[], mois: number) {
    const visiteMaintenance = visitesMaintenances.filter(x => x.mois == mois);
    return visiteMaintenance.length == 0 ? null : visiteMaintenance[0];
  }

}
