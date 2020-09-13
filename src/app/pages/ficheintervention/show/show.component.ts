import { Component, OnInit } from '@angular/core';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { Historique } from 'app/Models/Entities/Historique';
import { Client } from 'app/Models/Entities/Client';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ClientService } from 'app/services/client/client.service';

import { Memo } from 'app/Models/Entities/Memo';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MenuItem } from 'app/custom-module/primeng/api';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { UtilisateurService } from 'app/services/users/user.service';
import { InterventionTechnicien } from 'app/Models/Entities/InterventionTechnicien';
import { LoginService } from 'app/services/login/login.service';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { User } from 'app/Models/Entities/User';
import { SendMailParams } from 'app/Models/SendMailParams';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { StatutFicheTravail } from 'app/Enums/StatutFicheTravail.enum';

declare var toastr: any;
export declare var swal: any;

declare var jQuery: any;
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
})
export class ShowComponent implements OnInit {
  ficheIntervention: FicheIntervention = new FicheIntervention();
  historique: Historique = new Historique();
  //historique: Historique[];
  client: Client;
  adresseFacturation: string;
  chantiers: Chantier[] = [];
  memos: Memo[] = [];
  processIsStarting: boolean = false;

  loading = true;
  id;
  articles = [];
  statutFicheIntervention: typeof StatutFicheIntervention = StatutFicheIntervention;
  articlesInfo: any = {};
  statuts: { id: number; label: string; color: string }[];
  processing: boolean = false;
  isAdmin = true;
  base64 = null
  constructor(
    private ficheInterventionService: FicheInterventionService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private fileManagerService: FileManagerService,
    private paramteresService: ParameteresService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    this.route.params.subscribe(async params => {
      this.id = params['id'];
      this.init(this.id);
      this.processing = false;
    });

    this.translate
      .get('statuts')
      .subscribe((statuts: { id: number; label: string; color: string }[]) => {
        this.statuts = statuts;
      });
    this.isAdmin = (this.loginService.getUser().idProfile == UserProfile.admin);

  }

  async init(id) {
    // this.ficheIntervention = await this.getIntervention(id);
    await this.refresh();
    this.historique = JSON.parse(this.ficheIntervention.historique);
    this.client = this.ficheIntervention.chantier.client;
    this.memos = this.ficheIntervention.memos
      ? (JSON.parse(this.ficheIntervention.memos) as Memo[])
      : [];

  }

  getIntervention(id): Promise<FicheIntervention> {
    return new Promise((resolve, reject) => {
      this.ficheInterventionService.Get(id).subscribe(
        res => {
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


  // Generate pdf
  generatePDF() {
    this.ficheInterventionService.generatePDF(this.id).subscribe(
      res => {
        ;
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type
        var fileType = 'application/pdf';

        // file extension
        var extension = 'pdf';

        AppSettings.downloadBase64(',' + res, 'FI_' + stamp + '.' + extension, fileType, extension);
        this.loading = false;
      },
      err => {
        // alert('...');
        this.translate.get('errors').subscribe(text => {
          toastr.warning('', text.serveur, {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        });
      }
    );
  }

  formSendEmail = new FormGroup({
    emailTo: new FormControl('', Validators.required),
    object: new FormControl('', Validators.required),
    contents: new FormControl('', Validators.required),
  });
  items: MenuItem[] = [];
  ficheInterventionEmail: any[] = [];
  emails: any[];

  actionHistorique: ActionHistorique = new ActionHistorique();
  async generateReference() {
    ;
    let generate = () => {
      return new Promise((resolve, reject) => {
        this.paramteresService.Generate(TypeNumerotation.fiche_intervention as number).subscribe(
          async res => {
            resolve(res['data'] as string);
            // this.form.controls["reference"].setValue(res['data']);
          },
          err => {
            reject(err);
          }
        );
      });
    };

    let CheckUniqueReference = false;
    do {
      const res: any = await generate();
      CheckUniqueReference = await this.CheckUniqueReference(res);
      if (!CheckUniqueReference) {
        await this.IncremenetRefernce();
      } else {
        return res;
      }
    } while (CheckUniqueReference == false);
  }
  CheckUniqueReference(reference): Promise<boolean> {
    let promise: Promise<boolean> = new Promise((resolve, reject) => {
      this.ficheInterventionService.CheckUniqueReference(reference).subscribe(res => {
        if (res == true) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    return promise;
  }

  envoyer() {
    if (
      !this.formSendEmail.controls.emailTo.invalid &&
      !this.formSendEmail.controls.object.invalid &&
      !this.formSendEmail.controls.contents.invalid
    ) {
      this.ficheInterventionService.generatePDF(this.id).subscribe(
        (res: any) => {
          let mailParams: SendMailParams = {
            messageTo: [this.formSendEmail.controls.emailTo.value],
            Subject: this.formSendEmail.controls.object.value,
            content: this.formSendEmail.controls.contents.value,
            path: '',
            Bcc: [],
            Cc: [],
            attachments: [
              {
                name: `ficheIntervention-${this.ficheIntervention.reference}`,
                File: res,
              },
            ],
          };
          this.sendMailIntervention(this.ficheIntervention.id, mailParams);
        },
        err => {
          this.translate.get('errors').subscribe(text => {
            toastr.warning('', text.serveur, {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
          });
        }
      );
    }
  }

  sendMailIntervention(id, mailParams) {
    this.ficheInterventionService.sendEmail(id, mailParams).subscribe(
      res => {
        this.translate.get('sendMail.responses').subscribe(text => {
          jQuery('#sendByMail').modal('hide');
          this.getParametrageIntervention(res);

          if (res.statut == 200) {
            swal(text.success, '', 'success');
          } else if (res.statut == 300) {
            swal(text.serverHasNoConfig, '', 'warning');
          } else if (res.statut == 301) {
            swal(text.argumentsError, '', 'warning');
          } else if (res.statut == 302) {
            swal(text.internalError, '', 'warning');
          } else {
            swal(text.internalError, '', 'warning');
          }
        });
      },
      err => {
        (err);
      }
    );
  }
  dupliquer() {
    this.translate.get('dupliquer').subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(async isConfirm => {
        if (isConfirm) {
          let ficheIntervention: FicheIntervention = this.ficheIntervention;
          const reference = await this.generateReference();
          ficheIntervention.reference = reference;
          ficheIntervention.status = this.ficheIntervention.status == StatutFicheIntervention.Brouillon ? StatutFicheIntervention.Brouillon : StatutFicheIntervention.Planifiee;
          delete ficheIntervention['id'];
          delete ficheIntervention['chantier'];
          ficheIntervention['interventionTechnicien'] = (ficheIntervention['interventionTechnicien'] as InterventionTechnicien[])
            .map(element => {
              element.id = 0;
              element.idFicheIntervention = 0;
              element.idTechnicienNavigation = null;
              return element;
            });
          let historique = new Historique();
          historique.IdUser = this.loginService.getUser().id;
          historique.action = this.actionHistorique.Added;
          ficheIntervention.historique = JSON.stringify([historique]);
          ficheIntervention.idAgendaGoogle = null;
          this.loading = true;
          this.ficheInterventionService.Add(ficheIntervention).subscribe(
            async res => {
              ;
              this.loading = false;
              if (res) {
                ;
                await this.IncremenetRefernce();
                toastr.success(text.msg, text.title, {
                  positionClass: 'toast-top-center',
                  containerId: 'toast-top-center',
                });
                this.router.navigate(['/ficheintervention/detail', res.id]);
              }
            },
            err => {
              ;
              this.loading = false;
              swal(text.error, '', 'error');
            }
          );
        } else {
          swal(text.cancel, '', 'error');
        }
      });
    });
  }

  brouillon() {
    this.translate.get('Brouillon').subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(isConfirm => {
        if (isConfirm) {
          this.loading = true;
          this.ficheIntervention.status = StatutFicheIntervention.Brouillon;
          this.ficheInterventionService
            .Update(this.ficheIntervention.id, this.ficheIntervention)
            .subscribe(
              res => {
                this.ficheIntervention = res;
                this.articles = JSON.parse(res.prestations);
                this.historique.IdUser = this.loginService.getUser().id;
                this.historique = JSON.parse(this.ficheIntervention.historique) as Historique;
                //this.getUser();
                this.loading = false;
                swal(text.success, '', 'success');
              },
              err => {
                this.loading = false;
                swal(text.error, '', 'error');
              }
            );


        } else {
          swal(text.cancel, '', 'error');
        }
      });
    });
  }
  annulation() {
    this.translate.get('annulation').subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(isConfirm => {
        if (isConfirm) {
          this.loading = true;
          this.ficheIntervention.status = StatutFicheIntervention.Annulee;
          this.ficheInterventionService
            .Update(this.ficheIntervention.id, this.ficheIntervention)
            .subscribe(
              res => {
                this.ficheIntervention = res;
                this.articles = JSON.parse(res.prestations);
                this.historique.IdUser = this.loginService.getUser().id;
                this.historique = JSON.parse(this.ficheIntervention.historique) as Historique;
                //this.getUser();
                this.loading = false;
                swal(text.success, '', 'success');
              },
              err => {
                this.loading = false;
                swal(text.error, '', 'error');
              }
            );

          /*this.devisService.Delete(id).subscribe(res => {
              if (res) {
                swal(text.success, "", "success");
                this.rerender();
              }
              else {
                swal(text.error, "", "error");
              }
            });*/
        } else {
          swal(text.cancel, '', 'error');
        }
      });
    });
  }
  planifiee() {
    this.translate.get('planification').subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(isConfirm => {
        if (isConfirm) {
          this.loading = true;
          this.ficheIntervention.status = StatutFicheIntervention.Planifiee;
          this.ficheInterventionService
            .Update(this.ficheIntervention.id, this.ficheIntervention)
            .subscribe(
              res => {
                this.ficheIntervention = res;
                this.articles = JSON.parse(res.prestations);
                this.historique.IdUser = this.loginService.getUser().id;
                this.historique = JSON.parse(this.ficheIntervention.historique) as Historique;
                //this.getUser();
                this.loading = false;
                swal(text.success, '', 'success');
              },
              err => {
                this.loading = false;
                swal(text.error, '', 'error');
              }
            );

          /*this.devisService.Delete(id).subscribe(res => {
              if (res) {
                swal(text.success, "", "success");
                this.rerender();
              }
              else {
                swal(text.error, "", "error");
              }
            });*/
        } else {
          swal(text.cancel, '', 'error');
        }
      });
    });
  }
  // getUserById() {
  //   this.historique.forEach(async element => {
  //     this.utilisateurService.Get(element.IdUser).subscribe(Response => {
  //       element['nom'] = Response.nom;
  //     });
  //   })
  // }

  IncremenetRefernce(): Promise<any> {
    return new Promise((resolve, rejcet) => {
      this.paramteresService
        .Increment(TypeNumerotation.fiche_intervention as number)
        .subscribe(res => {
          resolve(res);
        });
    });
  }
  changeStatus(statut) {
    this.translate.get('annulation').subscribe(text => {
      swal({
        title: 'Changement du statut',
        text: 'vous voulez vraiment changer le statut de ce fiche intervention ?',
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: 'Changé avec success',
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(isConfirm => {
        if (isConfirm) {
          this.loading = true;
          this.ficheIntervention.status = statut;
          this.ficheInterventionService
            .Update(this.ficheIntervention.id, this.ficheIntervention)
            .subscribe(
              res => {
                this.ficheIntervention = res;
                this.articles = JSON.parse(res.prestations);
                this.historique.IdUser = this.loginService.getUser().id;
                this.historique = JSON.parse(this.ficheIntervention.historique) as Historique;
                // this.getUserById();
                this.loading = false;
                swal(text.success, '', 'success');
              },
              err => {
                this.loading = false;
                swal(text.error, '', 'error');
              }
            );

          /*this.devisService.Delete(id).subscribe(res => {
              if (res) {
                swal(text.success, "", "success");
                this.rerender();
              }
              else {
                swal(text.error, "", "error");
              }
            });*/
        } else {
          swal(text.cancel, '', 'error');
        }
      });
    });
  }

  refresh() {
    this.items = [];
    this.ficheInterventionService.Get(this.id).subscribe(res => {
      this.ficheIntervention = res;
      this.ficheInterventionEmail = JSON.parse(res.emails);
      this.getParametrageIntervention(this.ficheIntervention);
      this.historique = JSON.parse(res.historique);
      this.translate.get('labels').subscribe(text => {
        if (this.ficheIntervention.status != StatutFicheIntervention.Annulee /*|| ((this.ficheIntervention.status) as any) != StatutFicheIntervention.Brouillon*/) {
          this.items.push({
            label: text.annuler,
            icon: 'pi pi-times',
            command: () => {
              this.annulation();
            },
          });


        }
        // if (this.ficheIntervention.status == StatutFicheIntervention.Brouillon) {
        //   this.items.push({
        //     label: text.brouillon,
        //     icon: 'pi pi-times',
        //     command: () => {
        //       this.brouillon();
        //     },
        //   });
        // }
        // }
        this.items.push({
          label: text.dupliquer,
          icon: 'pi pi-copy',
          command: () => {
            this.dupliquer();
          },
        });
        // //PdfView
        // this.items.push({
        //   label: text.PdfView,
        //   icon: 'pi pi-eye',
        //   command: () => {
        //     this.generatePDFBase64(this.ficheIntervention.id);
        //     jQuery("#PdfView").modal("show");
        //   },
        // });
        //sendByMail
        this.items.push({
          label: text.sendByMail,
          icon: 'fa fa-paper-plane',
          command: async () => {
            jQuery("#sendByMail").modal("show");
            this.getParametrageIntervention(this.ficheIntervention);
          },
        });
        //  this.items.push({ label: text.print, icon: 'pi pi-print', command: () => { this.imprimerPDF(); } })
      });
      this.emails = JSON.parse(res.emails);
    });
  }
  getParametrageIntervention(dataintervention) {
    ;
    //  this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(data => {
    this.ficheInterventionService
      .getParametrageFicheIntervention(TypeParametrage.parametrageDevis)
      .subscribe((res: any) => {
        ;

        let data = JSON.parse(res.contenu);
        this.formSendEmail.setValue({
          // emailTo: this.devis,
          emailTo: dataintervention.chantier.client.email,
          object: data.sujetmail_interventions,
          contents: data.contenumail_interventions,
        });
        // if (JSON.parse(dataintervention.emails).length === 0) {
        //   this.formSendEmail.setValue({
        //     // emailTo: this.devis,
        //     emailTo: dataintervention.chantier.client.email,
        //     object: data.sujetmail_interventions,
        //     contents: data.contenumail_interventions
        //   });
        // } else {
        //   this.formSendEmail.setValue({
        //     emailTo: dataintervention.chantier.client.email,
        //     object: data.sujetrelance,
        //     contents: data.contenurelance
        //   });
        // }
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

      this.ficheInterventionService
        .saveMemos(this.ficheIntervention.id, "'" + JSON.stringify(memos) + "'")
        .subscribe(async res => {
          await this.init(this.ficheIntervention.id);
          this.processIsStarting = false;
        }, err => { throw new Error() });

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }

  generatePDFBase64(id: number): void {
    this.ficheInterventionService.generatePDF(id).subscribe(res => {
      this.base64 = res;
    }, err => {
      jQuery("#PdfView").modal("hide");
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });;
  }
  getLabelleByStatut(statut): string {
    if (statut == undefined) return;
    let statuts = this.statuts.filter(S => S.id == statut)[0];
    return statuts == undefined ? "" : statuts.label;
  }
  /** changer le statut du chantier  */
  changeStatutFicheIntervention(changeStatut: StatutFicheIntervention) {
    debugger
    this.translate.get(this.getTransalteLocationRequest(changeStatut)).subscribe(text => {
      swal({
        title: `${text.title} " ${this.ficheIntervention.reference} "`,
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
          this.ficheIntervention.status = changeStatut;
          this.ficheInterventionService
            .Update(this.ficheIntervention.id, this.ficheIntervention)
            .subscribe(
              res => {
                this.ficheIntervention = res;
                this.articles = JSON.parse(res.prestations);
                this.historique.IdUser = this.loginService.getUser().id;
                this.historique = JSON.parse(this.ficheIntervention.historique) as Historique;
                //this.getUser();
                this.loading = false;
                swal(text.success, '', 'success');
              },
              err => {
                this.loading = false;
                swal(text.error, '', 'error');
              }
            );
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
  getTransalteLocationRequest(statut: StatutFicheIntervention): string {
    debugger
    (statut)

    let StatusLabel: string = this.statutFicheIntervention[statut].toLowerCase();
    (StatusLabel)
    return `changeStatut.${StatusLabel}`;
  }
}
