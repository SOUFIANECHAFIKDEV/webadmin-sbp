import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { FactureService } from 'app/services/facture/facture.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Facture } from 'app/Models/Entities/Facture';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { Memo } from 'app/Models/Entities/Memo';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { MenuItem } from 'app/custom-module/primeng/api';
import { CreateFacture } from 'app/Enums/CreateFacture.Enum';
import { Historique } from 'app/Models/Entities/Historique';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { LoginService } from 'app/services/login/login.service';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FactureReferenceStatut } from 'app/Enums/FactureReferenceStatut.Enum';
import { SendMailParams } from 'app/Models/SendMailParams';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';
import { Chantier } from 'app/Models/Entities/Chantier';
import { FactureState } from '../facture-state';
import { Avoir } from 'app/Models/Entities/Avoir';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { PrestationsModule, LotProduits } from 'app/Models/Entities/Lots';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { FactureSituationDevis, FactureAcomptesDevis } from 'app/Models/Entities/Devis';
import * as _ from 'lodash';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';
import { ChantierService } from 'app/services/chantier/chantier.service';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
})
export class ShowComponent implements OnInit {
  id;
  facture: Facture = new Facture();
  historique;
  loading = false;
  typeFacture: typeof TypeFacture = TypeFacture;
  statutFacture: typeof StatutFacture = StatutFacture;
  memos: Memo[] = [];
  processIsStarting: boolean = false;
  actionsItems: MenuItem[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  emails: any[];
  client: Client;
  adresseFacturation: string;
  chantiers: Chantier[] = [];
  statuts: { id: number; label: string; color: string }[];
  articles = [];
  articlesInfo: any = {};
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  processing: boolean = false;
  idChantier: number = null;
  base64 = null;
  dataemail: any;
  factureEmail: any[] = [];
  formSendEmail = new FormGroup({
    emailTo: new FormControl('', Validators.required),
    object: new FormControl('', Validators.required),
    contents: new FormControl('', Validators.required),
  });
  clientInfo: Client = new Client();

  constructor(
    private translate: TranslateService,
    private factureService: FactureService,
    private route: ActivatedRoute,
    private fileManagerService: FileManagerService,
    private router: Router,
    private clientService: ClientService,
    private loginService: LoginService,
    private paramteresService: ParameteresService,
    private avoirService: AvoirService,
    private chantierService: ChantierService
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(async params => {
      debugger
      this.id = params['id'];
      this.translate.get('statuts').subscribe((statuts: { id: number; label: string; color: string }[]) => this.statuts = statuts);

      await this.init();
      this.processing = false;
    });
    this.route.params.subscribe(params => {
      this.idChantier = params['idChantier'];
    });
  }

  async init(): Promise<void> {
    await this.refresh();
    this.historique = JSON.parse(this.facture.historique);
    if (this.facture.chantier == null) {
      this.client = await this.getclientById(this.facture.idClient);
    } else {
      this.client = this.facture.chantier.client;
    }
    this.memos = this.facture.memos ? (JSON.parse(this.facture.memos) as Memo[]) : [];
  }

  getFacture(id): Promise<Facture> {
    debugger
    return new Promise((resolve, reject) => {
      this.factureService.Get(id).subscribe(
        res => {

          this.facture = res;
          this.articles = JSON.parse(res.prestations);
          this.historique = JSON.parse(this.facture.historique) as Historique[];

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

  getclientById(idClient): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(
        res => resolve(res),
        err => reject(err)
      );
    });
  }

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
  //       this.factureService
  //         .saveMemos(this.id, "'" + JSON.stringify(this.memos).toString() + "'")
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

      this.factureService
        .saveMemos(this.id, "'" + JSON.stringify(memos).toString() + "'")
        .subscribe(res => {
          this.memos = memos;
          this.processIsStarting = false;
        });

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }


  // Telecharger les memos
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

  // Refresh facture aprés l'ajout de paiement ou init component
  refresh(): Promise<void> {
    return new Promise((reslove, reject) => {
      this.factureService.Get(this.id).subscribe(async res => {
        this.facture = res;
        this.factureEmail = JSON.parse(res.emails);
        this.historique = JSON.parse(res.historique);
        this.articles = JSON.parse(res.prestations);
        this.emails = JSON.parse(res.emails);
        this.memos = this.facture.memos ? (JSON.parse(this.facture.memos) as Memo[]) : [];
        this.actionsItems = [];
        this.setActionsItems();
        if (res.chantier == null) {
          this.clientInfo = this.client;
        }
      }, err => {

      }, () => {
        reslove();
      });
    });
  }

  async setActionsItems() {
    const getTransaltion = () => {
      return new Promise((resolve, reject) => {
        this.translate.get('labels').subscribe(text => {
          resolve(text);
        });
      });
    }
    const labels: any = await getTransaltion();

    //dupliquer
    this.actionsItems.push({
      label: labels.dupliquer,
      icon: 'pi pi-copy',
      command: () => {
        this.dupliquerFacture();
      },
    });

    //annuler
    if (this.annullerFactureCondition(this.facture)) {
      this.actionsItems.push({
        label: labels.annuler,
        icon: 'pi pi-times',
        command: () => {
          this.annuler();
        },
      });
    }

    //sendByMail
    this.actionsItems.push({
      label: this.factureEmail.length == 0 ? labels.sendByMail : labels.revivalyMail,
      icon: 'fa fa-paper-plane',
      command: async () => {
        jQuery("#sendByMail").modal("show");
        this.GetParametrageDocument();
      },
    });

    //PdfView
    // this.actionsItems.push({
    //   label: labels.PdfView,
    //   icon: 'pi pi-eye',
    //   command: () => {
    //     this.generatePDFBase64(this.facture.id);
    //     jQuery("#PdfView").modal("show");
    //   },
    // });

    //print
    this.actionsItems.push({
      label: labels.print,
      icon: 'pi pi-print',
      command: () => {
        this.imprimerPDF();
      },
    });
    // 'labels.marquerrecuperer marquernonrecuperer' | translate }}

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
          // let statutR = null;
          // if (statut == StatutRetenueGarantie.nonrecuperer) {
          //   statutR = StatutRetenueGarantie.recuperer;
          // } else {
          //   statutR = StatutRetenueGarantie.nonrecuperer;
          // }
          this.chantierService.changeStatutRetenueGarantie({ idFacture: idFature, StatusRetenueGarantie: statut }).subscribe(async res => {
            if (res) {
              swal(text.success, "", "success");
              await this.refresh();
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
 * @summary fonction générique s'utiliser dans la fonction du changement du statut d'un chantier 
 * @todo déterminer la requête pour récupérer la traduction à partirdu ficher json de traduction
 * @param statut le statut du chantier qui nous voulons récupérer leur traduction
 */
  getTransalteLocationRequest(statut: StatutRetenueGarantie): string {
    debugger
    (statut)

    let StatusLabel: string = StatutRetenueGarantie[statut].toLowerCase();
    (StatusLabel)
    return `changeStatutRetenueGarantie.${StatusLabel}`;
  }


  GetParametrageDocument() {
    this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(async res => {

      const data = JSON.parse(res.contenu);
      if (this.facture.client != null) {
        this.dataemail = this.facture.client.email
      } else {
        if (this.facture.chantier == null) {
          const client = this.client;
          this.dataemail = client.email;
        } else {
          this.dataemail = this.facture.chantier.client.email;
        }
      }
      if (JSON.parse(this.facture.emails).length === 0) {
        this.formSendEmail.setValue({
          emailTo: this.dataemail,
          object: data.sujetmail_facture,
          contents: data.contenumail_facture
        });
      } else {
        this.formSendEmail.setValue({
          emailTo: this.dataemail,
          object: data.sujetrelance_facture,
          contents: data.contenurelance_facture
        });
      }
    });
  }

  annullerFactureCondition(facture: Facture): boolean {

    if (facture.typeFacture == this.typeFacture.Situation
      && this.facture.status != StatutFacture.Annule
      && this.facture.status != StatutFacture.Brouillon) {
      const situation: FactureSituationDevis[] = JSON.parse(this.facture.devis.situation) as FactureSituationDevis[];
      const index = _.findIndex(situation, function (o) { return o.idFacture == facture.id; });
      return (situation.length - 1 == index);
    } else if (facture.typeFacture == this.typeFacture.Acompte
      && this.facture.status != StatutFacture.Annule
      && this.facture.status != StatutFacture.Brouillon) {
      const acompte: FactureAcomptesDevis[] = JSON.parse(this.facture.devis.acomptes) as FactureAcomptesDevis[];
      const index = _.findIndex(acompte, function (o) { return o.idFacture == facture.id; });
      return (acompte.length - 1 == index);
    } else if (
      this.facture.status === StatutFacture.Encours ||
      this.facture.status === StatutFacture.Enretard ||
      this.facture.status === StatutFacture.Cloture
    ) {
      return true;
    }
  }

  // Dupliquer facture
  dupliquerFacture() {
    FactureState.facture = this.facture;
    this.navigateToCreationComponent();
  }

  navigateToCreationComponent() {
    let url = this.idChantier ? `/chantiers/${this.idChantier}/documents/facturation/ajouter/${CreateFacture.DUPLIQUER}` : `/factures/ajouter/${CreateFacture.DUPLIQUER}`;
    this.router.navigate([url]);
  }

  // Annuler facture
  annuler() {
    this.translate.get("showFacture.annuler").subscribe(text => {
      if (this.facture.facturePaiements.length == 0) {
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
            if (this.facture.facturePaiements.length == 0) {
              this.processIsStarting = true;
              const avoir = await this.createAvoir(this.facture);
              this.factureService.annulerFacture(this.facture.id, avoir).subscribe(res => {
                this.processIsStarting = false;
                if (res["id"] != null) {
                  this.IncremenetRefernceAvoir();
                  swal(text.success, "", "success");
                  this.router.navigate(["/avoirs/detail", res.id])
                } else {
                  if (FactureReferenceStatut.CONFIGURER_PERIODE_COMPTABLE == res.statut) {
                    swal(text.configurePeriodeComptable, "", "error");
                  }
                  else if (FactureReferenceStatut.PERIODE_N_EXISTE_PAS_OU_CLOTURE == res.statut) {
                    swal(text.periodeComptable, "", "error");
                  }
                }
              })
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

  generateReferenceAvoir(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.avoir as number).subscribe(
        res => {
          reslove(res['data'] as string);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  IncremenetRefernceAvoir() {
    this.paramteresService.Increment(this.typeNumerotation.avoir as number).subscribe(res => { });
  }

  CheckUniqueIsReference(control: FormControl) {
    const promise = new Promise((resolve, reject) => {
      this.avoirService.CheckUniqueReference(control.value).subscribe(res => {
        if (res == true) {
          resolve({ CheckUniqueReference: true });
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }

  /**
   *  facture Creation d avoir
   */
  async  createAvoir(facture: Facture) {

    let avoir: Avoir = new Avoir();
    avoir.dateCreation = new Date();
    avoir.dateEcheance = facture.dateEcheance;
    avoir.status = StatutAvoir.Utilise;
    avoir.reference = await this.generateReferenceAvoir();
    avoir.idChantier = this.facture.idChantier;
    avoir.prorata = this.facture.prorata;
    avoir.puc = this.facture.puc;
    avoir.remise = this.facture.remise;
    avoir.idClient = this.facture.idClient;
    avoir.infoClient = this.facture.infoClient;
    let total = this.facture.total
    avoir.total = total * (-1);
    let totalHt = this.facture.totalHt
    avoir.totalHt = totalHt * (-1);
    if (this.facture.tva != null) {
      this.facture.tva = (JSON.parse(this.facture.tva) as any).map(x => {
        x.totalHT = x.totalHT * (-1),
          x.totalTVA = x.totalTVA * (-1),
          x.totalTTC = x.totalTTC * (-1)
        return x;
      })
    }
    avoir.tva = this.facture.tva != null ? JSON.stringify(this.facture.tva) : null;
    avoir.tvaGlobal = this.facture.tvaGlobal;
    avoir.typeRemise = this.facture.typeRemise;

    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    avoir.historique = JSON.stringify([historique]);

    avoir.memos = JSON.stringify([]);

    let articles: PrestationsModule[] = JSON.parse(this.facture.prestations);
    if (articles.length > 0) {
      articles.forEach(element => {
        // article
        if (element.type == 1) {
          element.data.cout_vente *= -1;
          element.data.cout_materiel *= -1;
          element.data.prixHt *= -1;
          element.data.remise *= -1;
        }
        // lot Produits 
        if (element.type == 2) {
          element.data.lotProduits = this.changeValuesOfLotProduits(element.data.lotProduits);
        }
      });
    }

    avoir.prestations = JSON.stringify(articles);
    avoir.idFacture = this.facture.id
    avoir.conditionRegelement = this.facture.conditionRegelement;
    avoir.note = this.facture.note

    return avoir;
  }

  changeValuesOfLotProduits(lotProduits: LotProduits[]): LotProduits[] {
    let tpmLotProduits: LotProduits[] = [];
    lotProduits.forEach(element => {
      element.idProduitNavigation.cout_materiel *= -1;
      element.idProduitNavigation.cout_vente *= -1;
      element.idProduitNavigation.prixHt *= -1;
      tpmLotProduits.push(element);
    });
    return tpmLotProduits;
  }



  // Imprimer pdf
  imprimerPDF() {
    this.factureService.generatePDF(this.id).subscribe(res => {
      var stamp = new Date().getTime();

      // file type
      var fileType = 'application/pdf';

      // file data
      var fileData = AppSettings._base64ToArrayBuffer(res);

      // file extension
      var extension = 'pdf';
      let pdfSrc = AppSettings.printPdf(fileData, "Facture_" + stamp + "." + extension, fileType, extension);

      var objFra = document.createElement('iframe'); // Create an IFrame.
      objFra.style.visibility = 'hidden'; // Hide the frame.
      objFra.src = pdfSrc                   // Set source.
      document.body.appendChild(objFra); // Add the frame to the web page.
      objFra.contentWindow.focus(); // Set focus.
      objFra.contentWindow.print(); // Print it.
    });
  }

  sendMail() {
    if (
      !this.formSendEmail.controls.emailTo.invalid &&
      !this.formSendEmail.controls.object.invalid &&
      !this.formSendEmail.controls.contents.invalid
    ) {
      this.processing = true;
      this.factureService.generatePDF(this.id).subscribe((res: any) => {
        const mailParams: SendMailParams = {
          messageTo: [this.formSendEmail.controls.emailTo.value],
          Subject: this.formSendEmail.controls.object.value,
          content: this.formSendEmail.controls.contents.value,
          path: '',
          Bcc: [],
          Cc: [],
          attachments: [
            {
              name: `facture-${this.facture.reference}`,
              File: res,
            },
          ],
        };
        this.sendMailFacture(this.facture.id, mailParams);
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, () => {
        this.processing = false;
      });
    }
  }

  sendMailFacture(id, mailParams) {

    this.factureService.sendEmail(id, mailParams).subscribe(
      res => {
        this.translate.get('sendMail.responses').subscribe(async text => {
          if (res.statut == 200) {
            swal(text.success, '', 'success');
          }
          if (res.statut == 300) {
            swal(text.serverHasNoConfig, '', 'warning');
          }

          if (res.statut == 301) {
            swal(text.argumentsError, '', 'warning');
          }
          if (res.statut == 302) {
            swal(text.internalError, '', 'warning');
          }
          await this.refresh();
        });
      },
      err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, () => {
        jQuery('#sendByMail').modal('hide');
        this.formSendEmail.reset();
      }
    );
  }

  navigateToEditComponenet() {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation/modifier/${this.facture['id']}` : `/factures/modifier/${this.facture['id']}`;
    this.router.navigate([url]);
  }

  navigateToFactureList() {
    debugger
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation` : `/factures`
    this.router.navigate([url]);
  }


}
