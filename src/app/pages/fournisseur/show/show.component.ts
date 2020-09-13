import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { Contact } from 'app/Models/Entities/Contact';
import { Historique } from 'app/Models/Entities/Historique';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { UtilisateurService } from "./../../../services/users/user.service";
import { Memo } from 'app/Models/Entities/Memo';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
declare var toastr: any;
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

  id;
  fournisseur: Fournisseur
  contacts: Contact[] = [];
  historique: Historique[] = [];
  memos: Memo[] = [];

  constructor(private fournisseurService: FournisseurService, private route: ActivatedRoute, private translate: TranslateService, private fileManagerService: FileManagerService, private utilisateurService: UtilisateurService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.GetFournisseur();
    });
  }

  getUserById() {
    this.historique.forEach(async element => {
      this.utilisateurService.Get(element.IdUser).subscribe(Response => {
        element['nom'] = Response.nom;
      });
    });
  }

  GetFournisseur() {
    debugger
    this.fournisseurService.Get(this.id).subscribe(
      value => {

        this.fournisseur = value;
        this.contacts = JSON.parse(this.fournisseur.contacts) as (Contact[])
        this.historique = JSON.parse(this.fournisseur.historique) as Historique[];
        this.memos = this.fournisseur.memos ? JSON.parse(this.fournisseur.memos) as Memo[] : [];
        if (this.fournisseur.memos == "null") {
          this.memos = [];
        }
        this.getUserById()

      })
  }
  processIsStarting: boolean = false;
  // saveMemo(event) {
  //   this.processIsStarting = true;
  //   let memo = event as Memo;
  //   let files: FileManagerModel[] = [];
  //   memo.pieceJointes.forEach((pj, index) => {
  //     let file = new FileManagerModel();
  //     file.base64 = pj.file
  //     file.name = pj.name
  //     files.unshift(file);
  //     memo.pieceJointes[index].file = '';
  //   })

  //   this.memos.forEach((memo, i) => {
  //     memo.pieceJointes.forEach((pj, j) => {
  //       memo.pieceJointes[j].file = '';
  //     })
  //   })

  //   this.fileManagerService.Add(files).subscribe(res => {
  //     if (res) {
  //       this.memos.unshift(memo);
  //       this.fournisseurService.saveMemos(this.id, "'" + JSON.stringify(this.memos).toString() + "'")
  //         .subscribe(res => {
  //           this.processIsStarting = false;
  //           this.GetFournisseur();

  //         })
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

        this.fournisseurService.saveMemos(this.id, "'" + JSON.stringify(memos).toString() + "'")
          .subscribe(res => {
            this.processIsStarting = false;
            this.GetFournisseur();
          })

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }


  downloadPieceJointe(event) {
    let pieceJointe = event as PieceJoin;
    this.fileManagerService.Get(pieceJointe.name).subscribe(
      value => {
        pieceJointe.file = value['data'] as string;
        AppSettings.downloadBase64(value['data'], pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
      }
    )
  }

}
