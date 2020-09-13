import { Component, OnInit, ViewChild } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Client } from 'app/Models/Entities/Client';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from 'app/services/client/client.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Prestation } from 'app/Models/Entities/Prestation';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { Avoir, infoClientModel } from 'app/Models/Entities/Avoir';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { FactureReferenceStatut } from 'app/Enums/FactureReferenceStatut.Enum';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { TableArticleComponent } from 'app/common/table-article/table-article.component';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { LoginService } from 'app/services/login/login.service';
import { Historique } from 'app/Models/Entities/Historique';
import { Adresse } from 'app/Models/Entities/Adresse';
import { AngularEditorConfig } from '@kolkov/angular-editor';


declare var toastr: any;
declare var swal: any;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {

  @ViewChild(TableArticleComponent)
  tableArticleComponent: TableArticleComponent;

  form: FormGroup;
  dateLang
  clients: Client[] = [];
  typeClient: number;
  statutAvoir: typeof StatutAvoir = StatutAvoir
  actionHistorique: ActionHistorique = new ActionHistorique();
  loading = false;
  avoir: Avoir;
  id: number
  articles: Prestation[] = []
  reference: FactureReferenceModel
  prestations: any;
  articlesInfo: any = {};
  chantiers: Chantier[] = [];
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  emitter: any = {};

  client: Client = new Client();
  adresseFacturation: Adresse = new Adresse();
  adresses: Adresse[] = [];
  listClients: Client[] = [];

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    translate: 'yes',
  }
  processing: boolean = false;
  constructor(
    private translate: TranslateService,
    private clientService: ClientService,
    private avoirService: AvoirService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private paramteresService: ParameteresService,
    private chantierService: ChantierService,
    private loginService: LoginService,
  ) {
    this.form = this.fb.group({
      reference: [null, [Validators.required]],
      dateCreation: [null, [Validators.required]],
      dateEcheance: [null, [Validators.required]],
      idChantier: [null],
      // idClient: [null],
      object: [null],
      note: [null],
      conditionRegelement: [null],
      prorata: [null],
      tvaGlobal: [null],
      puc: [null],
      remise: [null],
      typeRemise: [null],
      retenueGarantie: [null],
      delaiGarantie: [null],
      status: [null],
      client: [null],
      adresseFacturation: [null, [Validators.required]],

    });
  }
  CheckUniqueReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.avoirService.CheckUniqueReference(control.value).subscribe(res => {
        if (res === true && control.value != this.form.value.reference) {
          resolve({ CheckUniqueReference: true });
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }


  ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.avoirService.Get(this.id).subscribe(
        res => {
          this.avoir = res;
          this.getChantiers('', this.avoir.idChantier);
          if (this.avoir.idChantier == null) {
            this.getClients('', this.avoir.idClient);
            let infoClient: infoClientModel = new infoClientModel();
            infoClient = JSON.parse(this.avoir.infoClient);
            let adresse = infoClient.adresseFacturation as Adresse;
            this.form.controls['adresseFacturation'].setValue(adresse);
          }
          if (this.avoir.status != this.statutAvoir.Brouillon) {
            this.router.navigate(["/avoirs"])
          }
          this.setData();
        }
      )
    });
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
  }

  // Pour récupérer la liste des clients
  getClients(search, id?: any) {


    this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc")
      .subscribe((res) => {

        this.clients = res.list;
        const client = res.list.filter(x => x.id == id)[0];
        this.form.controls['client'].setValue(client.nom);

      });
  }
  clearChantier() {
    this.getChantiers('');
    this.getClients('');
  }

  //s clientSelected: Client;
  loadClientAdresse(Client): Promise<void> {

    return new Promise((resolve, reject) => {
      // this.clientSelected = this.listClients.filter(c => c.id == Client.id)[0];
      // const {}
      const defaultAdresse = JSON.parse(Client.adresses) as Adresse[];
      const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
      if (!adresseFacturation) resolve();
      this.form.controls["adresseFacturation"].setValue(adresseFacturation);

    })

  }
  getChantiers(search, id?: any) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.processing = true;
        this.chantiers = res.list;
        this.form.controls['idChantier'].setValue(id == null ? null : id.toString());
        if (id != null) {
          await this.loadChantierClient(id);
        }

        this.processing = false;
      });
  }



  async loadChantierClient(idChantier) {
    const chantier = this.chantiers.filter(c => c.id == idChantier)[0];
    let idClient = chantier == undefined ? null : chantier.idClient;
    if (idClient == null) {
      this.client = null;
      this.adresses = [];
      // this.form.controls['adresseFacturation'].setValue(null);
      this.adresseFacturation = null;
      return;
    }
    this.client = await this.getclientById(idClient);
    // this.form.controls['client'].setValue(this.client);
    const adresses: Adresse[] = JSON.parse(this.client.adresses) as Adresse[];
    this.adresses = adresses == null ? [] : adresses;
    const defaultAdresse = JSON.parse(this.client.adresses) as Adresse[];
    const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
    // let adresseFacturation: Adresse[] = JSON.parse(this.client.adresses) as Adresse[];
    // this.adresseFacturation = adresseFacturation.filter(A => A.default == true)[0];
    this.form.controls['adresseFacturation'].setValue(adresseFacturation);


  }

  getclientById(idClient): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(
        res => {
          resolve(res);
        },
        err => {
          reject(err);
        }
      );
    });
  }
  setData() {


    this.articles = JSON.parse(this.avoir.prestations)
    this.form.controls["dateCreation"].setValue(new Date(this.avoir.dateCreation));
    this.form.controls["dateEcheance"].setValue(new Date(this.avoir.dateEcheance));

    this.form.controls['reference'].setValue(this.avoir.reference);
    this.form.controls['object'].setValue(this.avoir.object);
    this.form.controls['note'].setValue(this.avoir.note);
    this.form.controls['conditionRegelement'].setValue(this.avoir.conditionRegelement);
    this.form.controls['prorata'].setValue(this.avoir.prorata);
    this.form.controls['puc'].setValue(this.avoir.puc);
    this.form.controls['status'].setValue(this.avoir.status.toString());
    this.form.controls['remise'].setValue(this.avoir.remise);
    this.form.controls['typeRemise'].setValue(this.avoir.typeRemise);
    //const retenueGarantie = this.avoir.retenueGarantie == 1;
    this.form.controls['retenueGarantie'].setValue(this.avoir.retenueGarantie);
    this.form.controls['delaiGarantie'].setValue(this.avoir.delaiGarantie);

    this.form.controls['tvaGlobal'].setValue(this.avoir.tvaGlobal);

    this.articles = JSON.parse(this.avoir.prestations);

  }

  // Get information de form
  get f() { return this.form.controls; }





  // Pour générer reference d'avoir
  generateReference() {
    this.translate.get("errors").subscribe(text => {
      this.avoirService.GenerateReference(AppSettings.formaterDatetime(this.form.value["dateCreation"]))
        .subscribe(res => {
          this.reference = res;
          if (FactureReferenceStatut.OK == res.statut) {
            this.form.controls["reference"].setValue(res.reference);
          } else if (FactureReferenceStatut.CONFIGURER_PERIODE_COMPTABLE == res.statut) {
            swal(text.configurePeriodeComptable, "", "error");
          }
          else if (FactureReferenceStatut.PERIODE_N_EXISTE_PAS_OU_CLOTURE == res.statut) {
            swal(text.periodeComptable, "", "error");
          }
        })
    })
  }

  clientfacture: any
  createBodyRequest(status): Avoir {

    const formValue = this.form.value;
    const avoir: Avoir = new Avoir();
    avoir.reference = formValue.reference;
    avoir.idChantier = formValue.idChantier;
    avoir.status = status;
    avoir.memos = '[]';
    let dateCreation: any = AppSettings.formaterDatetime(formValue.dateCreation);
    avoir.dateCreation = dateCreation;
    let dateEcheance: any = AppSettings.formaterDatetime(formValue.dateEcheance);
    avoir.dateEcheance = dateEcheance
    avoir.object = formValue.object;
    avoir.note = formValue.note;
    avoir.conditionRegelement = formValue.conditionRegelement;
    avoir.prestations = this.prestations.prestation;
    //region : ajout des informations du client
    let infoClient: infoClientModel = new infoClientModel();
    if (avoir.idChantier != null) {
      this.clientfacture = this.client
    } else {
      this.clientfacture = formValue.client
    }
    if (formValue.idChantier == null && infoClient.codeClient == undefined && infoClient.adresseFacturation == undefined) {
      avoir.idClient = this.avoir.idClient;
      avoir.infoClient = this.avoir.infoClient;
    } else {
      avoir.idClient = this.clientfacture.id;
      infoClient.codeClient = this.clientfacture.codeclient;
      infoClient.nom = this.clientfacture.nom;
      infoClient.adresseFacturation = formValue.adresseFacturation;
      avoir.infoClient = JSON.stringify(infoClient);
    }
    //end region ajout des informations du client

    avoir.tva = this.prestations.tva;
    avoir.remise = this.prestations.remise;
    avoir.typeRemise = this.prestations.typeRemise;
    avoir.prorata = this.prestations.prorata;
    avoir.puc = this.prestations.puc;
    avoir.totalHt = this.prestations.totalHt;
    avoir.total = this.prestations.totalTtc;
    avoir.tvaGlobal = this.prestations.tvaGlobal;
    avoir.retenueGarantie = this.prestations.retenueGarantie;
    avoir.delaiGarantie = this.prestations.delaiGarantie;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    avoir.historique = JSON.stringify([historique]);
    return avoir;
  }

  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave(res => {
        resolve(res);
      });
    });
  }
  checkValiddelaiGarantie(retenueGarantie, delaiGarantie) {
    debugger
    if (retenueGarantie != null && (delaiGarantie == null || delaiGarantie == "null")) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning('Ajouter le délai de garantie', '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return false

    } else {
      return true
    }
  }
  async update(status) {
    debugger
    const compareDate = this.compareDate(
      this.form.value.dateEcheance,
      this.form.value.dateCreation
    );
    if (!compareDate) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning('text.datesIntervention', '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return;
    }
    this.prestations = await this.getDataFromArticlesComponet();
    console.log("prest avoiru", this.prestations)
    if (!this.checkValiddelaiGarantie(this.prestations.retenueGarantie, this.prestations.delaiGarantie)) {
      return
    }
    //  if (this.form.valid && this.prestations.prestation != '[]') {
    else if (this.form) {
      const createBody = this.createBodyRequest(status);
      this.avoirService.Update(this.id, createBody).subscribe(
        res => {
          if (res) {
            this.processing = true;
            this.translate.get('update').subscribe(text => {
              this.IncremenetRefernce();
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.router.navigate(['/avoirs/detail', res.id]);
            });
          }
        },
        err => {
          this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
          }, () => {
            this.processing = false;
          });
        });
    } else {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.fillAll, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
    }
  }
  IncremenetRefernce() {
    this.paramteresService.Increment(this.typeNumerotation.facture as number).subscribe(res => { });
  }
  compareDate(date1, date2) {
    //Note: 00 is month i.e. January
    var dateOne = new Date(date1); //Year, Month, Date
    var dateTwo = new Date(date2); //Year, Month, Date
    if (dateOne > dateTwo) {
      return true;
    } else {
      return false;
    }
  }

  // Save avoir
  saveAvoir(statut) {
    let avoir = this.createObjectAvoir(statut)
    this.avoirService.Update(this.avoir.id, avoir).subscribe(res => {
      if (res) {
        if (res['id'] != null) {
          this.translate.get("update").subscribe(text => {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/avoirs/detail", res.id]);
          })
        } else {
          //     var newReference = res as FactureReferenceModel;
          this.translate.get("referenceConfirmation").subscribe(text => {
            swal({
              title: text.title,
              //    text: text.question + " " + newReference.reference,
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
                //     this.reference = newReference;
                this.form.controls["reference"].setValue(res.reference);
                this.update(statut)
              } else {
                toastr.warning(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              }
            });
          });
        }
      }
      this.loading = false;
    },
      err => {
        this.loading = false;
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.errorServer, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      })
  }

  // Create objet avoir
  createObjectAvoir(statut) {
    let values = this.form.value;
    values = AppSettings.ConvertEmptyValueToNull(values)
    values["dateCreation"] = AppSettings.formaterDatetime(values["dateCreation"]);
    values["dateEcheance"] = AppSettings.formaterDatetime(values["dateEcheance"]);

    let avoir: Avoir = values;
    avoir.id = this.avoir.id
    avoir.status = statut;
    //avoir.idSociete = this.avoir.idSociete

    avoir.historique = this.avoir.historique;
    avoir.memos = this.avoir.memos;
    avoir.compteur = this.reference == null ? this.avoir.compteur : this.reference.compteur;

    // if (this.isFranchise) {
    //   this.tableProduitComponent.articles.map(x => x.historique = null);
    //   this.tableProduitComponent.articles.map(x => x.memos = null);
    //   this.tableProduitComponent.articles.map(x => x.label = null);
    //   this.tableProduitComponent.articles.map(x => x.promotions = null);
    //   this.tableProduitComponent.articles.map(x => x.images = null);
    //   this.tableProduitComponent.articles.map(x => x.description = null);

    //   avoir.articles = JSON.stringify(this.tableProduitComponent.articles);
    //   avoir.total = this.tableProduitComponent.globalTotalTTC
    //   avoir.totalHt = this.tableProduitComponent.remiseGloabl > 0 ? this.tableProduitComponent.globalTotalHTRemise : this.tableProduitComponent.globalTotalHT
    //   avoir.remise = this.tableProduitComponent.remiseGloabl
    //   avoir.typeRemise = this.tableProduitComponent.typeRemiseGloabl
    // } else {
    //   this.tableArticleComponent.articles.map(x => x.historique = null);
    //   this.tableArticleComponent.articles.map(x => x.memos = null);
    avoir.prestations = JSON.stringify(this.tableArticleComponent.articles);

    // avoir.total = this.tableArticleComponent.globalTotalTTC
    //  avoir.totalHt = this.tableArticleComponent.remiseGloabl > 0 ? this.tableArticleComponent.globalTotalHTRemise : this.tableArticleComponent.globalTotalHT
    avoir.remise = this.tableArticleComponent.remiseGloabl
    avoir.typeRemise = this.tableArticleComponent.typeRemiseGloabl
    // }

    return avoir;
  }

}
