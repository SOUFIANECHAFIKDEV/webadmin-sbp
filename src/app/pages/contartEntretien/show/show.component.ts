import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContratEntretienService } from 'app/services/contratEntretien/contrat-entretien.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Adresse } from 'app/Models/Entities/Adresse';
import { Client } from 'app/Models/Entities/Client';
import { StatutContratEntretien } from 'app/Enums/StatutContratEntretien.Enum';
import { Memo } from 'app/Models/Entities/Memo';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { ContratEntretien } from 'app/Models/Entities/ContratEntretien';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { ContratEntretienState } from '../contratEntretien-state';
import { CreateContratEntretien } from 'app/Enums/CreateContratEntretien.Enum';

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
  contratEntretien: ContratEntretien = new ContratEntretien();
  historique;
  statutContratEntretien: typeof StatutContratEntretien = StatutContratEntretien;
  memos: Memo[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  statuts: { id: number; label: string; color: string }[];
  id
  labels: any = null;
  constructor(
    private translate: TranslateService,
    private contratEntretienService: ContratEntretienService,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private fileManagerService: FileManagerService,

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

  async init(): Promise<void> {
    await this.refresh();
  }


  // Refresh facture aprés l'ajout de paiement ou init component
  refresh(): Promise<void> {
    return new Promise((reslove, reject) => {
      this.contratEntretienService.Get(this.id).subscribe(async res => {
        this.contratEntretien = res;
        this.historique = JSON.parse(res.historique);
        this.memos = this.contratEntretien.memos ? (JSON.parse(this.contratEntretien.memos) as Memo[]) : [];

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

  downloadPieceJointe(event) {
    let pieceJointe = event as PieceJoin;
    this.fileManagerService.Get(pieceJointe.name).subscribe(value => {
      pieceJointe.file = value['data'] as string;
      AppSettings.downloadBase64(
        value['data'],
        pieceJointe.orignalName,
        pieceJointe.file.substring('data:'.length, pieceJointe.file.indexOf(';base64')),
        pieceJointe.type
      );
    });
  }
  async saveMemo(memo: Memo) {
    this.processing = true;

    let files: FileManagerModel[] = memo.pieceJointes.map(PJ => {
      let file = new FileManagerModel();
      file.base64 = PJ.file;
      PJ.file = "";
      file.name = PJ.name;
      return file;
    });

    const addFiles = (files): Promise<boolean> => {
      return new Promise((resolve, reject) => this.fileManagerService.Add(files).subscribe(res => res ? resolve() : reject(), err => reject()));
    };

    try {
      const memos = [{
        commentaire: memo.commentaire,
        date: memo.date,
        idUser: memo.idUser,
        pieceJointes: memo.pieceJointes
      }, ...this.memos];

      await addFiles(files);
      this.contratEntretienService
        .saveMemos(this.contratEntretien.id, "'" + JSON.stringify(memos) + "'")
        .subscribe(async res => {
          await this.init();
          this.processing = false;
        }, err => { throw new Error() });

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }
  getLabelleByStatut(statut: StatutContratEntretien) {

    if (this.labels == null) {
      return
    }
    switch (statut) {
      case this.statutContratEntretien.Encours:
        return this.labels.encours;
        break;
      case this.statutContratEntretien.Enattente:
        return this.labels.enattente;
        break;
      case this.statutContratEntretien.Annule:
        return this.labels.annulee;
        break;
      case this.statutContratEntretien.Termine:
        return this.labels.termine;
        break;
      case this.statutContratEntretien.Brouillon:
        return this.labels.brouillon;
        break;
      // 
    }
  }

  changeStatut(statut: StatutContratEntretien) {
    debugger
    this.contratEntretienService.changeStatut({ idContratEntretien: this.contratEntretien.id, statutContratEntretien: statut }).subscribe(res => {
      if (res) {
        this.refresh();
      }
    })
  }

  /**
   * Dupliquer contrat entretien
   */
  dupliquerContratEntretien() {
    ContratEntretienState.contratEntretien = this.contratEntretien;
    this.router.navigate(['/contratentretiens/ajouter', CreateContratEntretien.DUPLIQUER])
  }

  exportExel() {
    this.contratEntretienService.exportGammeMaintenanceEquipement(this.contratEntretien.id).subscribe(value => {
      if (value) {
        debugger
        console.log("ok Exel")
        // this.loading = false;
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type 
        var fileType = 'application/vnd.ms-excel';

        // file data 
        var fileData = AppSettings._base64ToArrayBuffer(value.result);

        // file extension
        var extension = "xlsx";
        AppSettings.setFile(fileData, ("GammeMaintenanceEquipement") + stamp + "." + extension, fileType, extension);
      }
    })
  }

}
