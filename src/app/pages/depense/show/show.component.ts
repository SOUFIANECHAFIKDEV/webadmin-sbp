import { Component, OnInit, OnChanges } from '@angular/core';
import { Depense } from 'app/Models/Entities/depense';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { StatutDepense } from 'app/Enums/StatutDepense.Enum';
import { Memo } from 'app/Models/Entities/Memo';
import { MenuItem } from 'app/custom-module/primeng/api';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { Chantier } from 'app/Models/Entities/Chantier';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { TranslateService } from '@ngx-translate/core';
import { DepenseService } from 'app/services/depense/depense.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Historique } from 'app/Models/Entities/Historique';
import { DepenseState, CreateDepense } from '../depenseState';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerModel } from 'app/Models/FileManagerModel';

declare var jQuery: any;
declare var swal: any;
declare var toastr: any;
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit, OnChanges {
  id;
  depense: Depense = new Depense();
  calcule: ICalcule = new Calcule();
  historique;
  statutDepense: typeof StatutDepense = StatutDepense;
  memos: Memo[] = [];

  processIsStarting: boolean = false;
  items: MenuItem[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();

  fournisseurs: Fournisseur[] = [];
  statuts: { id: number; label: string; color: string }[];
  articles = [];
  articlesInfo: any = {};
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  processing: boolean = false;
  constructor(
    private translate: TranslateService,
    private depenseService: DepenseService,
    private route: ActivatedRoute,
    private fileManagerService: FileManagerService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate
      .get('statuts')
      .subscribe((statuts: { id: number; label: string; color: string }[]) => {
        this.statuts = statuts;
      });
    this.route.params.subscribe(async params => {
      this.id = params['id'];
      this.translate
        .get('statuts')
        .subscribe((statuts: { id: number; label: string; color: string }[]) => {
          this.statuts = statuts;
        });
      await this.refresh();
      await this.init(this.id);

    });

  }
  async ngOnChanges() {
    await this.init(this.id);
    await this.refresh();
  }

  async init(id) {
    this.depense = await this.getDepense(id);
    this.historique = JSON.parse(this.depense.historique);

    // this.memos = this.depense.memos ? (JSON.parse(this.depense.memos) as Memo[]) : [];
    if (this.depense.memos.length > 0) {
      this.memos = JSON.parse(this.depense.memos) as Memo[]
    } else {
      this.memos = []
    }
    this.processing = false;

  }
  getDepense(id): Promise<Depense> {

    return new Promise((resolve, reject) => {
      this.depenseService.Get(id).subscribe(
        res => {
          this.depense = res;
          this.articles = JSON.parse(res.prestations);
          this.historique = JSON.parse(this.depense.historique) as Historique[];
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

  //Dupliquer depense
  dupliquerDepense() {
    DepenseState.depense = this.depense;
    this.router.navigate(['/depense/ajouter', CreateDepense.DUPLIQUER]);

  }




  /**
  * Refresh bon commande fournisseur 
  */
  refresh() {

    this.items = [];
    this.depenseService.Get(this.id).subscribe(res => {
      this.depense = res;
      this.historique = JSON.parse(res.historique);
      this.memos = this.depense.memos ? (JSON.parse(this.depense.memos) as Memo[]) : [];
    });
  }



  /**
 *  Enregistrer Memos
 */
  // saveMemo(event) {

  //   this.processIsStarting = true;
  //   let memo = event as Memo;
  //   let files: FileManagerModel[] = [];
  //   memo.pieceJointes.forEach((pj, index) => {
  //     const file = new FileManagerModel();
  //     file.base64 = pj.file;
  //     file.name = pj.name;
  //     files.push(file);
  //     memo.pieceJointes[index].file = '';
  //   });

  //   this.memos.forEach((memo, i) => {
  //     memo.pieceJointes.forEach((pj, j) => {
  //       memo.pieceJointes[j].file = '';
  //     });
  //   });

  //   this.fileManagerService.Add(files).subscribe(res => {
  //     if (res) {

  //       this.memos.push(memo);
  //       this.depenseService
  //         .saveMemos(this.depense.id, "'" + JSON.stringify(this.memos).toString() + "'")
  //         .subscribe(res => {
  //           this.processIsStarting = false;
  //         });
  //     }
  //   });
  // }
  async saveMemo(memo: Memo) {
    this.processIsStarting = true;

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

      this.depenseService
        .saveMemos(this.depense.id, "'" + JSON.stringify(memos).toString() + "'")
        .subscribe(res => {
          this.memos = memos;
          this.processIsStarting = false;
        },err => { throw new Error() });

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }

  /**
   * Télécharger Mémo
   */
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

  memo: Memo = new Memo();
  commentaire: string = "";
  files = null;

  startUpload(event: FileList) {

    const file = event.item(0)
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let pieceJoin = new PieceJoin()
      pieceJoin.name = AppSettings.guid()
      pieceJoin.type = file.name.substring(file.name.lastIndexOf('.') + 1)
      pieceJoin.orignalName = file.name
      pieceJoin.file = reader.result.toString()
      this.memo.pieceJointes.push(pieceJoin)
      this.files = null;
    }
  }

  uploadStatus
  onFileChange(event) {
    this.uploadStatus = 0;
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
    }
  }

  deleteFile(i) {
    this.memo.pieceJointes.splice(i, 1)
  }
  /**
   * save file avoir
   */
  avoirdoc: Memo[] = [];
  saveDocAvoir() {

    this.depense
    if (this.commentaire != "" || this.memo.pieceJointes.length > 0) {

      let files: FileManagerModel[] = [];
      this.memo.pieceJointes.forEach((pj, index) => {
        const file = new FileManagerModel();
        file.base64 = pj.file;
        file.name = pj.name;
        files.push(file);
        this.memo.pieceJointes[index].file = '';
      });
      this.memo.commentaire = this.commentaire
      this.memo.date = new Date();
      this.memo.idUser = JSON.parse(localStorage.getItem("PDB_USER")).id;
      this.memo.pieceJointes = this.memo.pieceJointes,
        this.fileManagerService.Add(files).subscribe(res => {
          if (res) {
            this.avoirdoc.push(this.memo);
            this.depense.DocumentAvoir = JSON.stringify(this.avoirdoc).toString();
            this.depense.status = StatutDepense.Annule;
            this.depenseService
              .Update(this.depense.id, this.depense)
              .subscribe(res => {
                this.memo = new Memo()
                this.commentaire = ""
                this.processIsStarting = false;
                this.refresh();
              });
          }
        });


    }
  }

  annulerParAvoir() {
    this.translate.get("show.annuler").subscribe(text => {
      if (this.depense.paiements.length == 0) {
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
              closeModal: true
            },
            confirm: {
              text: text.confirm,
              value: true,
              visible: true,
              className: "",
              closeModal: true
            }
          }
        }).then(async isConfirm => {

          if (isConfirm) {
            if (this.depense.paiements.length == 0) {
              this.processIsStarting = true;
              jQuery("#add").modal("show");
              this.processIsStarting = false;

            } else {
              swal(text.failed, "", "error");
            }
          }
        });
      } else {
        swal(text.failedAnnuler, "", "error");
      }
    });
  }
}
