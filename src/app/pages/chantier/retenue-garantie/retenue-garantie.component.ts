import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ResultatCalculModel } from 'app/Models/ResultatCalculModel';
import { RetenueGarantieModel } from 'app/Models/RetenueGarantieModel';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';


declare var jQuery: any;
declare var swal: any;
declare var toastr: any;
@Component({
  selector: 'app-retenue-garantie',
  templateUrl: './retenue-garantie.component.html',
  styleUrls: ['./retenue-garantie.component.scss']
})
export class RetenueGarantieComponent implements OnInit {

  @Output('ChangeStatut') ChangeStatut = new EventEmitter();
  statutRetenueGarantie: typeof StatutRetenueGarantie = StatutRetenueGarantie;

  @Input('listRetenueGaranties') listRetenueGaranties: RetenueGarantieModel[] = [];
  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("statutsRetenue").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });
  }

  changerStatut(idFature, statut: StatutRetenueGarantie) {
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
          this.ChangeStatut.emit({ idFacture: idFature, StatusRetenueGarantie: statut });

        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
  /**
   * @summary fonction générique s'utiliser dans la fonction du changement du statut d'un chantier 
   * @todo déterminer la requête pour récupérer la traduction à partirdu ficher json de traduction
   * @param statut le statut du chantier qui nous voulons récupérer leur traduction
   */
  getTransalteLocationRequest(statut: StatutRetenueGarantie): string {
    debugger
    (statut)

    let StatusLabel: string = this.statutRetenueGarantie[statut].toLowerCase();
    (StatusLabel)
    return `changeStatutRetenueGarantie.${StatusLabel}`;
  }
  statuts: { id: number, label: string, color: string }[];

  getStatutRetenue(dateEcheance): StatutRetenueGarantie {
    if (dateEcheance != null) {
      const result = AppSettings.compareDate(dateEcheance, new Date());
      if (result) {
        return StatutRetenueGarantie.encours;

      } else {
        return StatutRetenueGarantie.enretard;

      }
    } else {
      return StatutRetenueGarantie.encours;
    }

  }


}
