import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { gammeMaintenanceEquipementContainerComponent } from 'app/common/gamme-maintenance-equipement-container/gamme-maintenance-equipement-container.component';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { ContratEntretien, EquipementContrat, PeriodiciteEquipement } from 'app/Models/Entities/ContratEntretien';
import { LibelleEquipement as LibelleEquipementInterface, OperationsEquipement as OperationsEquipementInterface } from 'app/common/gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';

@Component({
  selector: 'information-contratEntretien',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, OnChanges {

  @Input("contratEntretien") contratEntretien: ContratEntretien = null;
  gamme_maintenance_equipement_Selected: GammeMaintenanceEquipement[] = [];
  selectedGammeMaintenanceEquipement: number = 0;
  piecesJointes = [];
  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

  }
  ngOnChanges() {
    this.gamme_maintenance_equipement_Selected = this.formatGamme_maintenance_equipement_Selected(this.contratEntretien.equipementContrat);
    this.gamme_maintenance_equipement_Selected = this.gamme_maintenance_equipement_Selected.map(x => {
      x.equipement = JSON.parse(x.equipement);
      return x;
    });
    this.piecesJointes = JSON.parse(this.contratEntretien.piecesJointes);
  }


  jsonParse(data) {
    try {
      return JSON.parse(data);
    } catch (err) {
    }
  }

  formatGamme_maintenance_equipement_Selected(equipementContrat: EquipementContrat[]): GammeMaintenanceEquipement[] {
    if (equipementContrat == undefined) {
      return [];
    }
    const helper = (periodicite: PeriodiciteEquipement[]) => {
      const periods = [
        { mois: 1, value: false },
        { mois: 2, value: false },
        { mois: 3, value: false },
        { mois: 4, value: false },
        { mois: 5, value: false },
        { mois: 6, value: false },
        { mois: 7, value: false },
        { mois: 8, value: false },
        { mois: 9, value: false },
        { mois: 10, value: false },
        { mois: 11, value: false },
        { mois: 12, value: false }
      ];
      return periods.map(period => {
        if (periodicite.filter(x => x.mois == period.mois).length == 0) {
          return { mois: period.mois, value: false };
        } else {
          return { mois: period.mois, value: true };
        }
      });
    }
    return equipementContrat.map(equipement => {
      const libelle: LibelleEquipementInterface[] = equipement.libelle.map(libelle => {

        const operations: OperationsEquipementInterface[] = libelle.operationsEquipement.map(operation => {
          return {
            nom: operation.nom,
            periodicite: helper(operation.periodicite)
          };
        });
        let lib: LibelleEquipementInterface;
        if (libelle.nom == libelle.operationsEquipement[0].nom && libelle.operationsEquipement.length == 1) {
          lib = {
            nom: libelle.nom,
            operations: null,
            periodicite: operations[0].periodicite,
          };
        } else {
          lib = {
            nom: libelle.nom,
            operations: operations
          };
        }

        return lib;
      });
      const equi: GammeMaintenanceEquipement = {
        id: equipement.id,
        nom: equipement.nom,
        equipement: JSON.stringify(libelle)
      }
      return equi;
    });

  }

  /**
  * aficher le detail d'une gamme de maintenance d'equipement
  */
  detail_gamme_maintenance_equipement(gamme) {
    let dialogLotConfig = new MatDialogConfig();
    //dialogLotConfig.data = JSON.parse(gamme.equipement);
    dialogLotConfig.data = { listes: JSON.parse(gamme.equipement), readOnly: true, nom: gamme.nom };
    //dialogLotConfig.autoFocus = false,
    //: '90vh'
    dialogLotConfig.width = '1000px';
    dialogLotConfig.maxHeight = '90vh';
    const dialogRef = this.dialog.open(gammeMaintenanceEquipementContainerComponent, dialogLotConfig);

    dialogRef.afterClosed().subscribe((data) => {
      console.log(data);
      if (data != '' && data != undefined) {
        gamme.equipement = JSON.stringify(data.listes);
        gamme.nom = data.nom;
      }
    });
  }

  // Telecharger les memos 
  downloadPieceJointe(pieceJointe: PieceJoin) {
    this.fileManagerService.Get(pieceJointe.name).subscribe(
      value => {
        pieceJointe.file = value['data'] as string;
        AppSettings.downloadBase64(value['data'], pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
      }
    )
  }
}
