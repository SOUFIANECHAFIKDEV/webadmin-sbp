import { Component, OnInit } from "@angular/core";
import { Client } from "app/Models/Entities/Client";
import { Contact } from "app/Models/Entities/Contact";
import { Adresse } from "app/Models/Entities/Adresse";
import { ClientService } from "app/services/client/client.service";
import { ActivatedRoute } from "@angular/router";
import { Historique } from "app/Models/Entities/Historique";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { UtilisateurService } from "./../../../services/users/user.service";
import { Memo } from "app/Models/Entities/Memo";
import { FileManagerService } from "app/services/fileManager/file-manager.service";
import { FileManagerModel } from "app/Models/FileManagerModel";
import { PieceJoin } from "app/Models/Entities/PieceJoint";
declare var toastr: any;
declare var swal: any;

@Component({
  selector: "app-show",
  templateUrl: "./show.component.html",
  styleUrls: ["./show.component.scss"]
})
export class ShowComponent implements OnInit {
  id;
  client: Client;
  contacts: Contact[] = [];
  adresses: Adresse[];
  historique: Historique[];
  memos: Memo[] = [];
  processIsStarting: boolean = false;

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private utilisateurService: UtilisateurService,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetClient();
    });
  }

  getUserById() {
    this.historique.forEach(async element => {
      this.utilisateurService.Get(element.IdUser).subscribe(Response => {
        element['nom'] = Response.nom;
      });
    })
  }

  GetClient() {
    this.processIsStarting = true;
    this.clientService.Get(this.id).subscribe(value => {
      this.client = value;
      this.contacts = JSON.parse(this.client.contacts) as Contact[];
      this.adresses = JSON.parse(this.client.adresses) as Adresse[];
      this.historique = JSON.parse(this.client.historique) as Historique[];
      this.memos = this.client.memos ? JSON.parse(this.client.memos) as Memo[] : [];
      this.getUserById();
      this.processIsStarting = false;
    });

  }

  async saveMemo(memo: Memo) {
    debugger
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

      const result = await addFiles(files);

      this.clientService.saveMemos(this.id, "'" + JSON.stringify(memos).toString() + "'")
        .subscribe(res => {
          this.processIsStarting = false;
          this.GetClient();
        }, err => { throw new Error() });

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }


  deleteMemo(index: number) {
    debugger
    this.translate.get("commun.deleteMemo").subscribe(text => {
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
      }).then(isConfirm => {
        if (isConfirm) {
          this.memos.splice(index, 1);
          const memo: string = `${JSON.stringify(this.memos).toString()}`;
          this.clientService.updateMemos(this.id, memo).subscribe(res => {
            if (res) {
              toastr.success(text.success, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            }
          });
        } else {
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }

  updateMemo(data: { memo: Memo, index: number }) {
    debugger
    this.memos[data.index].commentaire = data.memo.commentaire;
    this.memos[data.index].pieceJointes = data.memo.pieceJointes;
    this.clientService.updateMemos(this.id, JSON.stringify(this.memos)).subscribe(res => {
      if (res) {
        this.translate.get("commun.update").subscribe(text => {
          toastr.success(text.success, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }
    });
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

  userClientIsActif: boolean = false;
  getUserClientStaut(event) {
    this.userClientIsActif = event;
  }


}
