import { Component, OnInit } from "@angular/core";
import { Produit } from "app/Models/Entities/Produit";
import { ProduitService } from '../../../services/produit/produit.service';
import { ActivatedRoute } from "@angular/router";
import { Historique } from "app/Models/Entities/Historique";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { UtilisateurService } from "./../../../services/users/user.service";
import { Memo } from "app/Models/Entities/Memo";
import { FileManagerService } from "app/services/fileManager/file-manager.service";
import { FileManagerModel } from "app/Models/FileManagerModel";
import { PieceJoin } from "app/Models/Entities/PieceJoint";
// import { insertPromotionModel } from '../../../Models/insertPromotionModel';
// import { promotion } from './../../../Models/Entities/promotion'
import { ShowCrudInProduitModule } from "../../../common/Helpers/ShowCrudInProduitModule";
declare var toastr: any;
declare var swal: any;
declare var toastr: any;
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {
  public id;
  public produit: Produit;
  public historique: Historique[];
  public memos: Memo[] = [];
  public allTagsList = [];
  public showCrud: boolean = true;
  public processIsStarting: boolean = false;
  public PrixParFournisseur: any;
  // public pomotionList: promotion[] = [];
  PrixParDefaut = null;
  constructor(
    private produitService?: ProduitService,
    private route?: ActivatedRoute,
    private translate?: TranslateService,
    private utilisateurService?: UtilisateurService,
    private fileManagerService?: FileManagerService,
    private showCrudInProduitModule?: ShowCrudInProduitModule
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetProduit();
    });
    // this.showCrud = this.showCrudInProduitModule.showOrNot();
  }

  getUserById() {
    this.historique.forEach(async element => {
      this.utilisateurService.Get(element.IdUser).subscribe(Response => {
        element['nom'] = Response.nom;
      });
    })
  }

  GetProduit() {
    this.produitService.Get(this.id).subscribe(value => {
      this.produit = value;
      this.memos = this.produit.fichesTechniques ? JSON.parse(this.produit.fichesTechniques) as Memo[] : [];
      console.log("memo", JSON.parse(this.produit.fichesTechniques))

      this.produit.labels = JSON.parse(value.labels);
      let labels: any = value.labels;
      labels.forEach(tag => {
        this.allTagsList.push({ value: tag, origine: false });
      });
      this.historique = JSON.parse(this.produit.historique) as Historique[];
      try {
        this.historique.sort((one, two) => {
          let x = new Date(one.date);
          let y = new Date(two.date);
          return (x.getTime() > y.getTime() ? -1 : 1);
        });
      } catch (ex) { }
      this.getUserById();
      (this.PrixParFournisseur);
    });
  }

  getimagesSrc(images): Promise<{ name: string, base64: string }[]> {
    let getbase64 = (img) => {
      return new Promise((resolve, reject) => {
        this.fileManagerService.Get(img).subscribe(res => {
          resolve({ name: img, base64: res });
          // resolve({ name: img, base64: res.data });
        });
      });
    };

    return new Promise((resolve, reject) => {
      try {
        let imagesBase64 = [];
        (images).forEach(img => {
          getbase64(img).then(res => {
            imagesBase64.push(res);
          });
        })
        resolve(imagesBase64)
      } catch (ex) {
        reject(ex)
      }
    });
  }

  saveMemo(event) {
    this.processIsStarting = true;
    let memo = event as Memo;
    let files: FileManagerModel[] = [];
    memo.pieceJointes.forEach((pj, index) => {
      let file = new FileManagerModel();
      file.base64 = pj.file
      file.name = pj.name
      files.push(file);
      memo.pieceJointes[index].file = '';
    })

    this.memos.forEach((memo, i) => {
      memo.pieceJointes.forEach((pj, j) => {
        memo.pieceJointes[j].file = '';
      })
    })
    const res = this.addFiles(files);
    if (res) {
      this.memos.push(memo);
      this.produitService.saveMemos(this.id, "'" + JSON.stringify(this.memos).toString() + "'")
        .subscribe(res => {
          this.processIsStarting = false;
          this.GetProduit();
        }, err => {
          console.log("vv", err)
          this.processIsStarting = false;
        })
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

  deleteMemo(index: number) {
    this.translate.get("commun.deleteFicheTechnique").subscribe(text => {
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
          this.produitService.UpdateFicheTehcnique(this.produit.id, this.memos).subscribe(res => {
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
    this.memos[data.index].commentaire = data.memo.commentaire;
    this.memos[data.index].pieceJointes = data.memo.pieceJointes;
    this.produitService.UpdateFicheTehcnique(this.produit.id, this.memos).subscribe(res => {
      if (res) {
        this.translate.get("commun.update").subscribe(text => {
          toastr.success(text.success, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }
    });
  }

  addFiles(files: FileManagerModel[]) {
    return new Promise((resolve, reject) => {
      this.fileManagerService.Add(files).subscribe(res => {
        resolve(res)
      });
    })
  }
}
