import { Component, OnInit } from '@angular/core';
import { Client } from 'app/Models/Entities/Client';
import { StatutContratEntretien } from 'app/Enums/StatutContratEntretien.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { Adresse } from 'app/Models/Entities/Adresse';
import { TranslateService } from '@ngx-translate/core';
import { ContratEntretienService } from 'app/services/contratEntretien/contrat-entretien.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from 'app/services/client/client.service';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';

import { ContratEntretien, EquipementContrat, LibelleEquipement, OperationsEquipement, PeriodiciteEquipement } from 'app/Models/Entities/ContratEntretien';
import { LibelleEquipement as LibelleEquipementInterface, OperationsEquipement as OperationsEquipementInterface } from 'app/common/gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';
import { MatDialog, MatDialogConfig } from "@angular/material";

import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { ListeGammeMaintenanceEquipementComponent } from 'app/common/liste-gamme-maintenance-equipement/liste-gamme-maintenance-equipement.component';
import { StatutPeriodiciteEquipement } from 'app/Enums/StatutPeriodiciteEquipement.Enum';

import * as _ from 'lodash';
import { resolve } from 'url';
import { Historique } from 'app/Models/Entities/Historique';
import { gammeMaintenanceEquipementContainerComponent } from 'app/common/gamme-maintenance-equipement-container/gamme-maintenance-equipement-container.component';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
declare var toastr: any;
@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  clients: Client[] = null;
  contratEntretien: ContratEntretien;
  statutContratEntretien: typeof StatutContratEntretien = StatutContratEntretien;
  actionHistorique: ActionHistorique = new ActionHistorique();
  dateLang: any;
  idClient: number = null;
  clientSelected: Client;
  processing: boolean = false;
  creationForm
  adresses: Adresse[] = [];
  id
  modificationForm
  gammeMaintenanceEquipementListe: GammeMaintenanceEquipement[] = null;
  gamme_maintenance_equipement_Selected_libelles: string[];
  piecesJointes: PieceJoin[] = [];
  constructor(
    private translate: TranslateService,
    private contratEntretienService: ContratEntretienService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private loginService: LoginService,
    private router: Router,
    private gammeMaintenanceEquipementService: GammeMaintenanceEquipementService,
    private dialog: MatDialog,
    private fileManagerService: FileManagerService
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.selectLanguage();
    this.buildCreationForm();
    this.route.params.subscribe(async params => {
      this.id = params['id'];
      this.contratEntretien = await this.getContratEntretien();
      this.piecesJointes = JSON.parse(this.contratEntretien.piecesJointes);
      //get the list of 'chantier'
      this.clients = await this.getClients('');
      await this.initializeCreationForm(this.contratEntretien);
      this.gamme_maintenance_equipement_Selected = this.formatGamme_maintenance_equipement_Selected(this.contratEntretien.equipementContrat);
      this.gamme_maintenance_equipement_Selected_libelles = this.gamme_maintenance_equipement_Selected.map(x => {
        return x.nom;
      });
      this.processing = false;
    });
  }

  /***
   * return a list of 'client'
   */
  getClients(search: string): Promise<Client[]> {
    if (this.clients == null) {
      return new Promise((resolve, reject) => {
        this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe(
          res => resolve(res.list),
          error => reject(error)
        );
      })
    }
  }
  /**
   * 
* @description construire le formulaire de création
*/
  buildCreationForm(): void {
    this.creationForm = this.formBuilder.group({
      idClient: [null, [Validators.required]],
      site: [null, [Validators.required]],
      dateDebut: [null, [Validators.required]],
      dateFin: [null, [Validators.required]],
    });
  }

  getIndexOfAdress(adresse: Adresse) {
    let index = null;
    this.adresses.forEach((item, i) => {
      if (_.isEqual(item, adresse)) {
        index = i;
      }
    });
    return index;
  }

  /** --------------------------------------------------
     @description initialiser le formulaire de création
     -------------------------------------------------- */
  async initializeCreationForm(contratEntretien: ContratEntretien): Promise<void> {
    const site = JSON.parse(contratEntretien.site)
    this.adresses = JSON.parse(contratEntretien.client.adresses);
    let index = this.getIndexOfAdress(site)
    this.creationForm.controls["idClient"].setValue(contratEntretien.idClient.toString());
    this.creationForm.controls["site"].setValue(index == null ? -1 : index.toString());
    this.creationForm.controls["dateDebut"].setValue(new Date(contratEntretien.dateDebut));
    this.creationForm.controls["dateFin"].setValue(new Date(contratEntretien.dateFin));
  }

  get f() { return this.creationForm.controls; }

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

  getContratEntretien(): Promise<ContratEntretien> {
    return new Promise((resolve, reject) => {
      this.contratEntretienService.Get(this.id).subscribe(res => resolve(res),
        err => reject(err)
      );
    });
  }

  loadAddreseClient(idClient) {
    if (idClient == null) {
      this.adresses = [];
      this.creationForm.controls["site"].setValue(null);
      return;
    }
    const clientInfos = this.clients.filter(client => client.id == idClient)[0];
    this.adresses = []; const adresses: Adresse[] = (JSON.parse(clientInfos.adresses) as Adresse[]);
    this.adresses = adresses == null ? [] : adresses;


  }
  createBodyRequest(statut) {
    const formeValue = this.creationForm.value;
    let contratEntretien: ContratEntretien = new ContratEntretien();

    //ajouter les info supplémentaire
    contratEntretien.statut = statut;
    contratEntretien.idClient = formeValue.idClient;
    let site: any = formeValue.site;
    if (site.designation == undefined) {
      site = JSON.stringify(this.adresses[parseInt(site)]);
    } else {
      site = JSON.stringify(formeValue.site);
    }
    contratEntretien.site = site;
    contratEntretien.dateDebut = AppSettings.formaterDatetime(formeValue.dateDebut);
    contratEntretien.dateFin = AppSettings.formaterDatetime(formeValue.dateFin);
    contratEntretien.historique = this.createHistorique();
    contratEntretien.equipementContrat = this.gamme_maintenance_equipement_Selected.map(equipementContrat => {

      const libelles: LibelleEquipement[] = (equipementContrat.equipement as any).map(equipement => {
        if (equipement.periodicite != null) {
          equipement.operations = [{
            nom: equipement.nom,
            periodicite: equipement.periodicite,
          }]
        }
        const op: OperationsEquipement[] = equipement.operations.map(ope => {
          const op: OperationsEquipement = {
            id: -4,
            idLotEquipement: -2,
            libelleEquipement: null,
            nom: ope.nom,
            periodicite: ope.periodicite.map(x => {
              if (x.value) {
                const periode: PeriodiciteEquipement = {
                  id: -3,
                  idOperationsEquipement: -4,
                  mois: x.mois,
                  observation: '',
                  operationsEquipement: null,
                  statut: StatutPeriodiciteEquipement.PasFait
                }
                return periode;
              }
            }).filter(x => x != null)
          }
          return op;

        });

        const libelle: LibelleEquipement = {
          nom: equipement.nom,
          id: -5,
          idEquipementContrat: -6,
          equipementContrat: null,
          operationsEquipement: op
        };
        return libelle;
      });
      //-----------------------------------------
      const equipement: EquipementContrat = {
        id: -7,
        nom: equipementContrat.nom,
        idContrat: -8,
        libelle: libelles
      }

      return equipement;
    });
    contratEntretien.piecesJointes = JSON.stringify(this.piecesJointes);
    return contratEntretien;
  }
  createHistorique() {
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    return JSON.stringify([historique]);
  }

  async update(statut) {
    this.processing = true;
    const compareDate = this.creationForm.value.dateFin == null || this.creationForm.value.dateFin == null ? true : AppSettings.compareDate(this.creationForm.value.dateFin, this.creationForm.value.dateDebut)
    if (!compareDate) {
      const translation = await this.getTranslationByKey('errors');
      toastr.warning(translation.datesIntervention, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      this.processing = false;
      return;
    }
    if (!this.creationForm.valid) {
      const translation = await this.getTranslationByKey('errors');
      toastr.warning(translation.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      this.processing = false;
      return;
    }


    const createBody = this.createBodyRequest(statut);
    if (createBody.equipementContrat.length == 0) {
      const translation = await this.getTranslationByKey('errors');
      toastr.warning(translation.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      this.processing = false;
      return;
    }

    this.contratEntretienService.Update(this.id, createBody).subscribe(async res => {
      if (res) {
        const translation = await this.getTranslationByKey('update');
        toastr.success(translation.msg, translation.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        this.router.navigate(["/contratentretiens/detail", this.contratEntretien.id]);
      }
    }, async err => {
      const translation = await this.getTranslationByKey('errors');
      toastr.warning(translation.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    }, () => {
      this.processing = false;
    })

  }
  /**
  * get translation By Key
  */
  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation)
      });
    });
  }


  gamme_maintenance_equipement_Selected: GammeMaintenanceEquipement[] = [];
  gamme_maintenance_equipement_liste: GammeMaintenanceEquipement[] = [];


  formatGamme_maintenance_equipement_Selected(equipementContrat: EquipementContrat[]): GammeMaintenanceEquipement[] {
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
        equipement: libelle as any
      }
      return equi;
    });

  }

  async select_gamme_maintenance_equipement(): Promise<void> {
    this.gamme_maintenance_equipement_liste = await this.getGammeMaintenanceEquipementListe();
    let dialogLotConfig = new MatDialogConfig();
    dialogLotConfig.data = null;
    dialogLotConfig.width = '1000px';
    dialogLotConfig.height = '500px';
    const gamme_maintenance_equipement_liste = [];
    this.gamme_maintenance_equipement_liste.forEach(element => {
      const result = this.gamme_maintenance_equipement_Selected.filter(x => x.nom == element.nom);
      if (result.length == 0) {
        gamme_maintenance_equipement_liste.unshift(element);
      }
    });
    dialogLotConfig.data = gamme_maintenance_equipement_liste;

    const dialogRef = this.dialog.open(ListeGammeMaintenanceEquipementComponent, dialogLotConfig);

    dialogRef.afterClosed().subscribe((data) => {
      if (data != '') {
        this.gamme_maintenance_equipement_Selected = this.gamme_maintenance_equipement_Selected.concat(data);
        console.log(JSON.parse(this.gamme_maintenance_equipement_Selected[0].equipement));
      }
    });
  }

  /**
  * Modifier une gamme de maintenance d'equipement
  */
  modifier_gamme_maintenance_equipement(gamme: GammeMaintenanceEquipement): void {
    let dialogLotConfig = new MatDialogConfig();
    //data input
    dialogLotConfig.data = { listes: JSON.parse(gamme.equipement), readOnly: false, nom: gamme.nom };
    //pop up config
    dialogLotConfig.width = '1000px';
    dialogLotConfig.maxHeight = '90vh';
    const dialogRef = this.dialog.open(gammeMaintenanceEquipementContainerComponent, dialogLotConfig);
    //data output
    dialogRef.afterClosed().subscribe((data) => {
      console.log(data);
      if (data != '' && data != undefined) {
        gamme.equipement = JSON.stringify(data.listes);
        gamme.nom = data.nom;
      }
    });
  }
  /**
* Suprimmer une gamme de maintenance d'equipement
*/
  suprimmer_gamme_maintenance_equipement(index): void {
    this.gamme_maintenance_equipement_Selected.splice(index, 1);
  }

  /**
   * @desriprion Récupererla liste des gammes Maintenance d'equipement
   */
  getGammeMaintenanceEquipementListe(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gammeMaintenanceEquipementService.GetAll('', 1, AppSettings.MAX_GET_DATA, "nom", "asc").subscribe(res => {
        resolve(res.list);
      });
    });
  }
  selectedGammeMaintenanceEquipement: number = 0;
  /**
   * @description la fonctionnalité principale de cette méthode est le changement d'onglet
   * @param index l'index d'equipement dans @property gamme_maintenance_equipement_Selected
   */
  async changeTab(index: number): Promise<void> {
    //selectionner l'index d'esquipepemnt déja afichée
    const currentIndex: number = this.selectedGammeMaintenanceEquipement;

    //récuperer la traduction
    const translation = await this.getTranslationByKey('errors');

    //vérifier si le nom est saisi
    if (this.gamme_maintenance_equipement_Selected[currentIndex].nom.length == 0) {
      toastr.warning(translation.equipement.minLengthNom, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      return;
    }

    //vérifier si le nom est supérieur à trois caractéres
    if (this.gamme_maintenance_equipement_Selected[currentIndex].nom.length < 3) {
      toastr.warning(translation.equipement.required, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      return;
    }

    //vérifier si la listes des operation n'est pas vide
    if (this.gamme_maintenance_equipement_Selected[currentIndex].equipement.length == 0) {
      toastr.warning(translation.equipement.perationsRequired, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      return;
    }

    //changer l'onglet
    this.selectedGammeMaintenanceEquipement = index;
  }

  saveNewAddress(adresses: Adresse[]) {
    const idClient = this.creationForm.value.idClient;
    if (idClient != null) {
      const client = this.clients.filter(x => x.id == idClient)[0];
      const oldAdresses: Adresse[] = JSON.parse(client.adresses);
      let index = adresses.length - 1;
      const newAdresse = adresses[index];
      oldAdresses.unshift(newAdresse)
      client.adresses = JSON.stringify(oldAdresses);
      this.clientService.Update(parseInt(idClient), client).subscribe(res => {
        if (res) {
          this.translate.get("adresse").subscribe(text => {
            this.clients.filter(x => x.id == idClient)[0] = client;
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.adresses = JSON.parse(res.adresses);
            this.creationForm.patchValue({
              site: newAdresse,
            });
          });
        }
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      });
    }
  }

  /** ****************************************
  * files logique
  **************************************** */
  /**
   * get the file from the user device
   */
  startUpload(event: FileList): void {
    const file = event.item(0)
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let pieceJoin = new PieceJoin()
      pieceJoin.name = AppSettings.guid()
      pieceJoin.type = file.name.substring(file.name.lastIndexOf('.') + 1)
      pieceJoin.orignalName = file.name
      pieceJoin.file = reader.result.toString()
      this.piecesJointes.push(pieceJoin);
    }
  }

  downloadPieceJointe(index: number) {
    let pieceJointe = this.piecesJointes[index];
    if (pieceJointe.file != "") {
      AppSettings.downloadBase64(pieceJointe.file, pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
    } else {
      this.fileManagerService.Get(pieceJointe.name).subscribe(
        value => {
          pieceJointe.file = value['data'] as string;
          AppSettings.downloadBase64(value['data'], pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
        }
      )
    }
  }

  removeFile(index: number) {
    this.piecesJointes.splice(index, 1);
  }
}
