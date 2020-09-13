import { Component, OnInit } from '@angular/core';
import { Devis } from 'app/Models/Entities/Devis';
import { Historique } from 'app/Models/Entities/Historique';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DevisService } from 'app/services/devis/devis.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { ClientService } from 'app/services/client/client.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { SendMailParams } from 'app/Models/SendMailParams';
import { MenuItem } from 'app/common/MenuItem';

export declare var swal: any;
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {
  devis: Devis;
  historique: Historique = new Historique();
  id
  loading = false;
  articles = [];
  statutDevis: typeof StatutDevis = StatutDevis;

  addType: string = 'minimaliste';
  articlesInfo: any = {};
  statuts: { id: number, label: string, color: string }[];
  processing: boolean = false;
  displayData;
  idChantier: number = null;
  base64 = null;
  section: string = null;
  labels: any = null;
  constructor(
    private devisService: DevisService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private paramteresService: ParameteresService,
    private loginService: LoginService,
    private router: Router,
    private chantierService: ChantierService,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    this.route.params.subscribe(params => {

      this.id = params["id"];
      this.GetDevis(this.id);
      this.refresh();
      //this.generatePDFBase64(this.id);
    });

    if (this.route.snapshot.queryParamMap.has('section')) {
      // this.route.snapshot.queryParamMap.get('section') == 'factures de situation'
      this.section = this.route.snapshot.queryParamMap.get('section');
      // factureAcompte factureSituation section
    }
    this.translate.get("labels").subscribe(text => {
      this.labels = text;
    });


    this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });
    this.idChantier = await this.getIdChantier();

  }

  getIdChantier(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params["idChantier"]))
    });
  }


  GetDevis(id) {
    debugger
    this.devis
    this.processing = true;
    this.devisService.Get(id).subscribe(async (value: Devis) => {
      this.devis = value;
      this.devis.facture = value.facture,
        this.articles = JSON.parse(value.prestation);
      this.historique = JSON.parse(this.devis.historique);
      //this.getUserById();
      this.addType = value.devisExel == null ? 'complet' : 'minimaliste';
      this.articlesInfo = {
        totalHt: value.totalHt,
        total: value.total,
        puc: value.puc,
        prorata: value.prorata,
        tva: value.tva,
        tvaGlobal: value.tvaGlobal,
        nomberHeure: value.nomberHeure,
        coutVente: value.coutVente,
        coutMateriel: value.coutMateriel,
        achatMateriel: this.devis.achatMateriel,
        retenueGarantie: this.devis.retenueGarantie,
        delaiGarantie: this.devis.delaiGarantie,

        devisExel: JSON.parse(value.devisExel)
      };
      this.processing = false;
    });
  }
  getchantier(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.chantierService.Get(id).subscribe(res => {
        resolve(res);
      });
    })

  }

  // Generate pdf
  generatePDF() {

    this.loading = true;
    this.devisService.generatePDF(this.id).subscribe(

      res => {

        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type 
        var fileType = 'application/pdf';

        // file extension
        var extension = "pdf";

        AppSettings.downloadBase64("," + res, "DV_" + stamp + "." + extension, fileType, extension)
        this.loading = false;
      }, err => {
        // alert('...');
        this.translate.get("errors").subscribe(text => {
          toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }
    )
  }


  async generateReference() {

    let generate = () => {
      return new Promise((resolve, reject) => {
        this.paramteresService.Generate(TypeNumerotation.devis as number)
          .subscribe(async res => {
            resolve(res['data'] as string);
            // this.form.controls["reference"].setValue(res['data']);
          }, err => {
            reject(err);
          })
      });
    }

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
      this.devisService
        .CheckUniqueReference(reference)
        .subscribe(res => {
          if (res == true) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
    });
    return promise;
  }

  actionHistorique: ActionHistorique = new ActionHistorique();
  dupliquer() {

    this.translate.get("dupliquer").subscribe(text => {
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

          let devis: Devis = this.devis;
          const reference = await this.generateReference();
          devis.reference = reference;
          // devis.id = 0;
          delete devis['id']
          delete devis['chantier']
          delete devis['facture']
          let historique = new Historique();
          historique.IdUser = this.loginService.getUser().id;
          historique.action = this.actionHistorique.Added;
          devis.historique = JSON.stringify([historique]);

          this.loading = true;
          this.devisService.Add(devis).subscribe(async res => {

            this.loading = false;
            if (res) {
              await this.IncremenetRefernce()
              toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              this.router.navigate(["/devis/detail", res.id]);
            }
          }, err => {
            this.loading = false;
            swal(text.error, "", "error");
          });

        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
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
          this.loading = true;
          this.devis.status = StatutDevis.Annulee;
          this.devisService.Update(this.devis.id, this.devis).subscribe(res => {
            this.devis = res;
            this.articles = JSON.parse(res.prestation);
            this.historique = JSON.parse(this.devis.historique);
            //this.getUserById();
            this.loading = false;
            swal(text.success, "", "success");
          }, err => {
            this.loading = false;
            swal(text.error, "", "error");
          });

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
          swal(text.cancel, "", "error");
        }
      });
    });
  }
  IncremenetRefernce(): Promise<any> {
    return new Promise((resolve, rejcet) => {
      this.paramteresService.Increment(TypeNumerotation.devis as number)
        .subscribe(res => {
          resolve(res);
        })
    });
  }
  changeStatus(statut) {
    this.translate.get("annulation").subscribe(text => {
      swal({
        title: "Changement du statut",
        text: "vous voulez vraiment changer le statut de ce devis ?",
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
            text: "Changé avec success",
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {

          this.devis.status = statut;
          this.devisService.Update(this.devis.id, this.devis).subscribe(res => {
            this.devis = res;
            //this.articles = JSON.parse(res.prestation);
            //this.historique = JSON.parse(this.devis.historique) as Historique[];
            //this.getUserById();
            this.articles = JSON.parse(res.prestation);
            this.historique = JSON.parse(this.devis.historique);


            swal(text.success, "", "success");
          }, err => {

            swal(text.error, "", "error");
          });
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  formSendEmail = new FormGroup({
    emailTo: new FormControl('', Validators.required),
    object: new FormControl('', Validators.required),
    contents: new FormControl('', Validators.required)
  });
  items: MenuItem[] = []
  devisEmail: any[] = []
  emails: any[];

  refresh() {

    this.items = []
    this.devisService.Get(this.id).subscribe(
      res => {

        this.devis = res;
        this.devisEmail = JSON.parse(res.emails);
        this.getParametrageDevis(this.devis);
        this.historique = JSON.parse(res.historique);

        this.translate.get("labels").subscribe(text => {
          if (this.devis.status == StatutDevis.EnAttente || this.devis.status == StatutDevis.Acceptee || this.devis.status == StatutDevis.NonAcceptee) {
            this.items.push({ label: text.annuler, icon: 'pi pi-times', command: () => { this.annulation(); } })
          }
          this.items.push({ label: text.dupliquer, icon: 'pi pi-copy', command: () => { this.dupliquer(); } })
          //  this.items.push({ label: text.print, icon: 'pi pi-print', command: () => { this.imprimerPDF(); } })
          if (this.devis.devisExel == null) {
            this.items.push({
              label: this.devisEmail.length == 0 ? text.sendByMail : text.revivalyMail,

              //   label: text.dupliquer, 
              icon: 'fa fa-paper-plane',
              command: async () => {
                jQuery("#sendByMail").modal("show");
                this.getParametrageDevis(this.devis);
              },
            })

          }
        });
        this.emails = JSON.parse(res.emails);

      }
    )
  }



  getParametrageDevis(datadevis) {


    //  this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(data => {
    this.devisService.getParametrageDevis(TypeParametrage.parametrageDevis).subscribe((res: any) => {


      let data = JSON.parse(res.contenu);

      if (JSON.parse(datadevis.emails).length === 0) {
        this.formSendEmail.setValue({
          // emailTo: this.devis,
          emailTo: datadevis.chantier.client.email,
          object: data.sujetmail,
          contents: data.contenumail
        });
      } else {
        this.formSendEmail.setValue({
          emailTo: datadevis.chantier.client.email,
          object: data.sujetrelance,
          contents: data.contenurelance
        });
      }
    })
  }

  envoyer() {
    if (!this.formSendEmail.controls.emailTo.invalid && !this.formSendEmail.controls.object.invalid && !this.formSendEmail.controls.contents.invalid) {
      this.devisService.generatePDF(this.id).subscribe((res: any) => {
        let mailParams: SendMailParams = {
          messageTo: [this.formSendEmail.controls.emailTo.value],
          Subject: this.formSendEmail.controls.object.value,
          content: this.formSendEmail.controls.contents.value,
          path: "",
          Bcc: [],
          Cc: [],
          attachments: [{
            name: `devis-${this.devis.reference}`,
            File: res
          }]
        };
        this.sendMailDevis(this.devis.id, mailParams);
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    }
  }

  sendMailDevis(id, mailParams) {

    this.devisService.sendEmail(id, mailParams).subscribe(res => {
      this.translate.get("sendMail.responses").subscribe(async text => {
        jQuery("#sendByMail").modal("hide");
        this.getParametrageDevis(res);

        if (res.statut == 200) {
          swal(text.success, "", "success");
        }
        else if (res.statut == 300) {
          swal(text.serverHasNoConfig, "", "warning");
        }

        else if (res.statut == 301) {
          swal(text.argumentsError, "", "warning");
        }
        else if (res.statut == 302) {
          swal(text.internalError, "", "warning");
        }
        else {
          swal(text.internalError, "", "warning");
        }
        await this.refresh();
      });
    }, (err) => {
      jQuery("#sendByMail").modal("hide");
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    })
  }

  getTransalteLocationRequest(statut: StatutDevis): string {
    (statut)

    let StatusLabel: string = this.statutDevis[statut].toLowerCase();
    (StatusLabel)
    return `changeStatutdevis.${StatusLabel}`;

  }


  changeStatutDevis(changeTostatut: StatutDevis) {
    debugger

    this.translate.get(this.getTransalteLocationRequest(changeTostatut)).subscribe(text => {

      swal({

        title: `${text.title} " ${this.devis.reference} "`,
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
          debugger
          this.devis.status = changeTostatut;
          this.devisService.Update(this.devis.id, this.devis).subscribe(res => {

            if (res) {
              this.historique = JSON.parse(this.devis.historique);
              swal(text.success, "", "success");
              // this.GetDevis(this.id);

            } else {
              swal(text.error, "", "error");
            }
          }, err => {
            swal(text.error, "", "error");
          });
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  navigateToEditComponenet(): void {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/devis/modifier/${this.devis['id']}` : `/devis/modifier/${this.devis['id']}`;
    this.router.navigate([url]);
  }

  navigateToDevisList(): void {

    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/devis` : `/devis`;
    this.router.navigate([url]);
  }

  generatePDFBase64(id: number): void {
    this.devisService.generatePDF(id).subscribe(res => {
      this.base64 = res;
    }, err => {
      jQuery("#PdfView").modal("hide");
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });;
  }

  // getLabelleByStatut(statut): string {
  //   debugger
  //   if (statut == undefined) return;
  //   let statuts = this.statuts.filter(S => S.id == statut)[0];
  //   return statuts == undefined ? "" : statuts.label;
  // }
  getLabelleByStatut(statut) {
    if (this.labels == null) {
      return
    }
    switch (statut) {
      case this.statutDevis.EnAttente:
        return this.labels.enattente;
        break;
      case this.statutDevis.Acceptee:
        return this.labels.acceptee;
        break;
      case this.statutDevis.Annulee:
        return this.labels.annulee;
        break;
      case this.statutDevis.NonAcceptee:
        return this.labels.nonacceptee;
        break;
      case this.statutDevis.Facture:
        return this.labels.facture;
        break;
      // 
    }
  }


}
