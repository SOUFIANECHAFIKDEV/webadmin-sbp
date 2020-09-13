import { Component, OnInit } from '@angular/core';
import { BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { Memo } from 'app/Models/Entities/Memo';
import { MenuItem } from 'app/custom-module/primeng/api';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { Client } from 'app/Models/Entities/Client';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';

import { BonCommandeFournisseurService } from 'app/services/bonCommandeFournisseur/bonCommandeFournisseur.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Historique } from 'app/Models/Entities/Historique';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { BonCommandeFournisseurState, CreateBonCommandeFournisseur } from '../bonCommandeFournisseurState';


import { Depense } from 'app/Models/Entities/depense';
import { PrestationInterventionModel } from 'app/Models/PrestationInterventionModel';
import { DepenseState, CreateDepense } from 'app/pages/depense/depenseState';
import * as _ from 'lodash';

declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

  bonCommandeFournisseur: BonCommandeFournisseur = new BonCommandeFournisseur();
  historique;
  calcule: ICalcule = new Calcule();
  statutBonCommandeFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur;
  memos: Memo[] = [];
  processIsStarting: boolean = false;
  items: MenuItem[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  adresseFacturation: string;
  statuts: { id: number; label: string; color: string }[];
  articles = [];
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  processing: boolean = false;
  search = "";
  page = 1;
  totalPage = 0;
  finished = true;
  articlesSelected: any
  articlesBc: any

  constructor(
    private translate: TranslateService,
    private bonCommandeService: BonCommandeFournisseurService,
    private route: ActivatedRoute,
    private fileManagerService: FileManagerService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('statuts').subscribe((statuts: { id: number; label: string; color: string }[]) => { this.statuts = statuts; });
    this.route.params.subscribe(async params => {
      const bonCommandeFournisseur = await this.getBonCommandeFournisseur(params['id']);
      await this.init(bonCommandeFournisseur);
    });


  }

  async init(bonCommandeFournisseur: BonCommandeFournisseur) {
    this.bonCommandeFournisseur = bonCommandeFournisseur;
    this.selectBcArticles(bonCommandeFournisseur);
    this.historique = JSON.parse(bonCommandeFournisseur.historique) as Historique[];
    this.memos = bonCommandeFournisseur.memos ? (JSON.parse(bonCommandeFournisseur.memos) as Memo[]) : [];
    this.articles = JSON.parse(bonCommandeFournisseur.articles);
    this.processing = false;
  }

  getBonCommandeFournisseur(id): Promise<BonCommandeFournisseur> {
    return new Promise((resolve, reject) => {
      this.bonCommandeService.Get(id).subscribe(
        res => {
          resolve(res)
            , err => {
              this.translate.get('errors').subscribe(text => {
                toastr.warning(text.serveur, '', {
                  positionClass: 'toast-top-center',
                  containerId: 'toast-top-center',
                });
              });
              resolve(new BonCommandeFournisseur());
            }
        });
    });
  }

  /**
   * Anneler Bon Commande Fournisseur
   */
  annulation() {
    this.translate.get("annulation").subscribe(text => {
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
          this.processing = true;
          const bonCommandeFournisseur: BonCommandeFournisseur = this.bonCommandeFournisseur;
          bonCommandeFournisseur.status = StatutBonCommandeFournisseur.Annule;
          this.bonCommandeService.Update(bonCommandeFournisseur.id, bonCommandeFournisseur).subscribe(res => {
            this.init(res);
            swal(text.success, "", "success")
          }, err => {
            swal(text.error, "", "error");
          }, () => {
            this.processing = false;
          });
        } else {
          swal(text.cancel, "", "error");
        }
      })
    });
  }

  /**
   *  Dupliquer Bon Commande Fournisseur
   */
  dupliquerBonCommandeFournisseur(): void {
    BonCommandeFournisseurState.bonCommandeFournisseur = this.bonCommandeFournisseur;
    this.navigateTo('Creation');
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
  //       this.route.params.subscribe(async params => {
  //         this.bonCommandeService
  //           .saveMemos(params["id"], "'" + JSON.stringify(this.memos).toString() + "'")
  //           .subscribe(res => {
  //             this.processIsStarting = false;
  //           });
  //       })
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

      this.route.params.subscribe(async params => {
        this.bonCommandeService
          .saveMemos(params["id"], "'" + JSON.stringify(memos).toString() + "'")
          .subscribe(res => {
            this.memos = memos;
            this.processIsStarting = false;
          });
      })

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

  async navigateTo(direction: string) {
    let url = '';
    const idChantier = await this.getIdChantier();
    switch (direction) {
      case 'Creation':
        url = idChantier ? `/chantiers/${idChantier}/documents/commandes_devis/ajouter/${CreateBonCommandeFournisseur.DUPLIQUER}` : `/bonCommandeFournisseur/ajouter/${CreateBonCommandeFournisseur.DUPLIQUER}`;
        break;
      case 'Edit':
        url = idChantier != null ? `/chantiers/${idChantier}/documents/commandes_devis/modifier/${this.bonCommandeFournisseur['id']}` : `/bonCommandeFournisseur/modifier/${this.bonCommandeFournisseur['id']}`;
        break;
      case 'BonCommandeList':
        url = idChantier != null ? `/chantiers/${idChantier}/documents/commandes_devis` : `/bonCommandeFournisseur`;
        break;
    }
    this.router.navigate([url]);
  }

  getIdChantier(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params["idChantier"]))
    });
  };

  /** ================================================================================= */



  selectBcArticles(bonCommandeFournisseur: BonCommandeFournisseur) {
    this.articlesSelected = [];
    this.articlesBc = this.getArticlesBc(bonCommandeFournisseur);
  }

  getArticlesBc(bonCommandeFournisseur: BonCommandeFournisseur) {
    debugger
    const prestationsBc: any[] = JSON.parse(bonCommandeFournisseur.articles);
    if (bonCommandeFournisseur.depenseBonCommandeFournisseurs.length == 0) {
      return prestationsBc;
    }

    if (bonCommandeFournisseur.depenseBonCommandeFournisseurs.length != 0) {
      let listArticlesUnSelected = [];
      let depenses = bonCommandeFournisseur.depenseBonCommandeFournisseurs;
      //  let depenses:Depenses = bonCommandeFournisseur.depenseBonCommandeFournisseurs.map(x=> return x.depense);

      let depensesTmp: any[] = [];

      depenses.forEach(item => {
        const prestations = JSON.parse(item.depense.prestations);
        depensesTmp = depensesTmp.concat(prestations);
      });

      prestationsBc.forEach(prestation => {
        const depensesPresCount = depensesTmp.filter(x => {
          // x.data.tva == prestation.data.tva
          // && 
          if (x.data.id === prestation.data.id && x.data.tva === prestation.data.tva && x.data.qte === prestation.data.qte) {
            return true;
          }
          // && x.data.qte == prestation.data.qte
        }).length;

        const bcPresCount = prestationsBc.filter(x => {
          if (x.data.id === prestation.data.id && x.data.tva === prestation.data.tva && x.data.qte === prestation.data.qte) {
            return true;
          }
        }).length;

        const selectedPresCount = listArticlesUnSelected.filter(x => {
          if (x.data.id === prestation.data.id && x.data.tva === prestation.data.tva && x.data.qte === prestation.data.qte) {
            return true;
          }
        }).length;

        let ifExists = false;

        if ((bcPresCount > depensesPresCount) && (selectedPresCount < (bcPresCount - depensesPresCount))) {
          ifExists = true;
        }

        if (ifExists) {
          listArticlesUnSelected.unshift(prestation);
        }
      });

      return listArticlesUnSelected;
    }
  }
  /**
   * Recherche des articles de bon de commande fournisseur
   */
  searchArticle() {
    // this.page = 1;
    // this.articlesBc = [];
    // this.selectDefaultArticle(this.bonCommandeFournisseur);
  }

  /**
   * On cas de scroll dans popup d articles
   */
  onScroll() {
    // this.page++;
    // this.selectDefaultArticle(this.bonCommandeFournisseur);
    // if (this.totalPage = this.page) {
    //   this.finished = true
    // }
  }

  /**
   * Selectioné les articles 
   */
  addArticle(index) {
    let article = this.articlesBc[index]
    this.articlesSelected.push(article)
    this.articlesBc.splice(index, 1)
  }
  /**
   * Déselectioné 
   */
  removeArticle(index) {
    let article = this.articlesSelected[index]
    this.articlesBc.push(article)
    this.articlesSelected.splice(index, 1)
  }

  /**
   * save
   */
  saveArticle() {
    debugger
    if (this.articlesSelected.length > 0) {
      let depense = new Depense
      let articles: PrestationInterventionModel[] = [];
      let idsBonCommandeFournisseur = [];
      idsBonCommandeFournisseur.push(this.bonCommandeFournisseur.id)
      depense.idChantier = this.bonCommandeFournisseur.idChantier
      depense.chantier = this.bonCommandeFournisseur.chantier
      depense.idFournisseur = this.bonCommandeFournisseur.idFournisseur
      depense.prestations = JSON.stringify(this.articlesSelected)
      depense.tva = null;
      DepenseState.depense = depense;
      DepenseState.idBonCommandeFournisseur = idsBonCommandeFournisseur
      this.router.navigate(['/depense/ajouter/', CreateDepense.Bon_Commande_Fournisseur]);
      jQuery("#createdepense").modal("hide");
      (articles);
    }
  }
}
