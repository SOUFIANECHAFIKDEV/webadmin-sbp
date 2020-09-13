import { Component, OnInit, ViewChild } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from 'app/services/facture/facture.service';
import { ClientService } from 'app/services/client/client.service';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { infoClientModel } from 'app/Models/Entities/Avoir';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { Client } from 'app/Models/Entities/Client';
import { Historique } from 'app/Models/Entities/Historique';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { FactureState } from '../facture-state';
import { CreateFacture } from 'app/Enums/CreateFacture.Enum';
import { Facture } from 'app/Models/Entities/Facture';
import { Adresse } from 'app/Models/Entities/Adresse';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { ParametrageContenuDevis, Parametrage } from 'app/Models/Entities/Numerotation';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';
declare var toastr: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddFactureComponent implements OnInit {
  chantiers: Chantier[] = null;
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  statutAvoir: typeof StatutAvoir = StatutAvoir;
  statutFacture: typeof StatutFacture = StatutFacture;
  actionHistorique: ActionHistorique = new ActionHistorique();
  prestations: any;
  tva: any;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    translate: 'yes',
  };
  chantierPreDefini = null;
  dateLang: any;
  emitter: any = {};
  remise = 0
  typeRemise = '€'
  puc = 0
  prorata = 0
  retenueGarantie = 0
  delaiGarantie = null;

  reference: FactureReferenceModel
  datafacture
  idFicheIntervention = null
  idDevis = null
  processing: boolean = false;
  creationForm: any = null;
  listClients: Client[] = null;
  idChantier: number = null;
  defaultsValues: ParametrageContenuDevis = null;
  clientSelected: Client;
  constructor(
    private translate: TranslateService,
    private chantierService: ChantierService,
    private paramteresService: ParameteresService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private factureService: FactureService,
    private clientService: ClientService,
    private loginService: LoginService,
    private router: Router,
  ) { }

  /** ---------------------------------------------
      @description initialisations of the component 
      ---------------------------------------------*/
  async ngOnInit() {

    this.processing = true;

    this.selectLanguage();

    this.creationForm = this.buildCreationForm();

    await this.initializeCreationForm();

    this.defaultsValues = await this.getDefaultsValues();

    await this.getFactureCreate();
    this.processing = false;

  }

  getFactureCreate(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(async params => {
        if (params["id"] == CreateFacture.DUPLIQUER) {
          await this.initChantierInfo();
          await this.dataFactureDuplique(params)
        } else if (params["id"] == CreateFacture.FICHE_INTERVENTION) {
          await this.dataFactureFicheIntervention(params);
        } else if (params["id"] == CreateFacture.DEVIS) {
          await this.dataFactureDevis(params);
        }
        else {
          await this.initChantierInfo();
          await this.setDefaultValueFacture();
        }
        resolve();
      });
    });
  }

  async initChantierInfo() {
    debugger
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(async params => {
        this.idChantier = params["idChantier"];
        if (this.idChantier != null) {
          if (this.idChantier != null) {
            const chantier = await this.getChantier(this.idChantier)
            this.creationForm.controls['idChantier'].setValue(chantier.nom);
            this.loadChantierInformation(this.idChantier);
          }
        }
        resolve();
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

  getChantier(idChantier: number): Promise<Chantier> {
    debugger
    return new Promise((resolve, reject) => {
      this.chantierService.Get(idChantier ? idChantier : this.idChantier).subscribe((res: Chantier) => {
        resolve(res)
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Create Facture   dupliquer
   * @param params 
   */
  dataFactureDuplique(params) {
    this.datafacture = FactureState.facture;
    this.setData(params["id"], this.datafacture)
    this.getChantiersData('', this.datafacture.idChantier);
    if (this.datafacture.idChantier == null) {
      this.getClientsData('', this.datafacture.idClient);
    }
    this.loadChantierInformation(this.datafacture.idChantier);
  }

  /**
   * Create Facture  from  fiche intervention
   */
  async dataFactureFicheIntervention(params) {
    this.datafacture = FactureState.facture;
    const idficheIntervention = FactureState.idFicheTravail;
    await this.setDataFicheInterventionOrDevis(params["id"], this.datafacture, idficheIntervention)

  }
  /***
   * @description Create Facture  from devis
   */

  async dataFactureDevis(params) {
    this.datafacture = FactureState.facture;
    //const idDevis = FactureState.idDevis;
    await this.setDataFicheInterventionOrDevis(params["id"], this.datafacture, this.idDevis)

  }

  /**
  * @description construire le formulaire de création
  */
  buildCreationForm(): FormGroup {
    return this.formBuilder.group({
      reference: [null, [Validators.required]],
      idChantier: [null],
      dateCreation: [new Date(), [Validators.required]],
      dateEcheance: [null, [Validators.required]],
      object: [],
      note: [],
      conditionRegelement: [],
      client: [null, [Validators.required]],
      adresseFacturation: [null]
    });
  }

  /**
  * @description récupérer la date Échéance
  */
  getDateEcheance(): Promise<Date> {
    return new Promise(async (resolve, reject) => {
      this.defaultsValues = (this.defaultsValues != null) ? (this.defaultsValues) : await this.getDefaultsValues();
      var dateToday = new Date();
      if (this.defaultsValues.validite_facture != null && this.defaultsValues.validite_facture != '') {
        dateToday.setDate(dateToday.getDate() + parseInt(this.defaultsValues.validite_facture.toString()));
      }
      resolve(dateToday)
    });
  }

  /** ---------------------------------------------------------
      * data facture
      * @param number  for route
      * @param data  facture
      * @param idDocument  soit id fiche intervention ou devis
      ----------------------------------------------------------*/
  async setDataFicheInterventionOrDevis(number, data, idDocument) {
    debugger
    let facture = data as Facture;
    if (number == CreateFacture.DEVIS && data != null) {
      this.idDevis = data.idDevis;

    } if (number == CreateFacture.FICHE_INTERVENTION && data != null) {
      this.idFicheIntervention = idDocument;
    }
    this.prestations = JSON.parse(facture.prestations);
    this.remise = facture.remise
    this.typeRemise = facture.typeRemise
    this.puc = facture.puc
    this.prorata = facture.prorata
    this.retenueGarantie = facture.retenueGarantie;
    this.delaiGarantie = facture.delaiGarantie;

    this.getChantiersData('', this.datafacture.idChantier);
    this.loadChantierInformation(this.datafacture.idChantier);
    // try {
    //   console.log("this.datafacture.chantier.client.adresses", this.datafacture.chantier.client.adresses)
    //   const defaultAdresse = JSON.parse(this.datafacture.chantier.client.adresses);
    //   const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
    //   // this.creationForm.controls["client"].setValue('client');
    //   this.creationForm.controls["client"].setValue(this.datafacture.chantier.client);
    //   this.creationForm.controls["adresseFacturation"].setValue(adresseIntervention);
    // } catch (ex) {
    //   console.log(ex);
    // }

    await this.setDefaultValueFacture();
  }
  loadChantierINdEVISInformation(idChantier): Promise<void> {
    return new Promise(async (reslove, reject) => {
      if (idChantier == null) {
        this.creationForm.controls["adresseFacturation"].setValue(null);
        this.creationForm.controls["client"].setValue(null);
      } else {
        // this.idChantier = idChantier;
        const chantier = await this.getChantier(idChantier);
        // this.creationForm.controls['idChantier'].setValue(chantier.nom);
        // const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
        // const { idClient } = chantier;
        // const client = await this.getclientById(idClient);
        try {
          this.creationForm.controls["client"].setValue('client');
          this.creationForm.controls["client"].setValue(chantier.client);
        } catch (ex) {
          // console.log(ex);
        }
        const defaultAdresse = JSON.parse(chantier.client.adresses) as Adresse[];
        const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
        if (!adresseIntervention) reslove();
        this.creationForm.controls["adresseFacturation"].setValue(adresseIntervention);

      }
      reslove();
    });
  }

  /** --------------------------------------------------------------
      @description return the defaults values from the configuration
      -------------------------------------------------------------- */
  async setData(number, data) {
    debugger


    if (number == CreateFacture.DUPLIQUER && data != null) {
      let facture = data as Facture;

      this.prestations = JSON.parse(facture.prestations);
      this.creationForm.controls['object'].setValue(facture.object);
      this.creationForm.controls['note'].setValue(facture.note);
      this.creationForm.controls['conditionRegelement'].setValue(facture.conditionRegelement);
      this.remise = facture.remise
      this.typeRemise = facture.typeRemise
      this.puc = facture.puc
      this.prorata = facture.prorata
      this.retenueGarantie = facture.retenueGarantie;
      this.delaiGarantie = facture.delaiGarantie;
    }
  }

  /** --------------------------------------------------
      @description initialiser le formulaire de création
      -------------------------------------------------- */
  async initializeCreationForm(): Promise<void> {
    this.creationForm.controls['reference'].setValue(await this.GetUniqueReference());
    this.creationForm.controls['dateCreation'].setValue(new Date);
    this.creationForm.controls['dateEcheance'].setValue(await this.getDateEcheance())
  }

  getChantiersData(search, id?: any) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
        this.creationForm.controls['idChantier'].setValue(id == null ? null : id.toString());
      });
  }
  /** ---------------------------------
      @description Get List des Clients
      --------------------------------- */
  getClients(): void {
    if (this.listClients != null) {
      return;
    }

    this.processing = true;

    this.clientService.GetAll("", 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe((res) => {
      this.listClients = res.list;
    }, err => {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.serveur, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }, () => {
      this.processing = false;
    });

  }
  // Pour récupérer la liste des clients
  getClientsData(search, id?: any) {
    this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc")
      .subscribe((res) => {
        this.listClients = res.list;
        const client = res.list.filter(x => x.id == id)[0];
        this.creationForm.controls['client'].setValue(client.nom);
        this.loadClientAdresse(client)
      });
  }

  /**
   * Load info client
   */

  loadClientAdresse(Client): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientSelected = this.listClients.filter(c => c.id == Client.id)[0];
      // const {}
      const defaultAdresse = JSON.parse(this.clientSelected.adresses) as Adresse[];
      const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
      if (!adresseFacturation) resolve();
      this.creationForm.controls["adresseFacturation"].setValue(adresseFacturation);

    })

  }
  /**
   * return a reference for the new insertion
   */
  generateReference(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.facture as number).subscribe(
        res => {
          reslove(res['data'] as string);
        },
        err => {
          (err);
        }
      );
    });
  }
  /**
   * return a list of 'chantier'
   */
  getChantiers(search, haveSerach?: boolean): void {
    if (!haveSerach && this.chantiers != null) { return; }
    this.processing = true;
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
      }, err => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, () => {
        this.processing = false;
      });
  }

  /**
   * return the defaults values from the configuration
   */

  async setDefaultValueFacture() {
    // const CheckUniqueReference = (value): Promise<any> => {
    //   return new Promise((resolve, reject) => {
    //     this.factureService.CheckUniqueReference(value).subscribe(res => {
    //       resolve(res);
    //     });
    //   });
    // }

    // let generatedReference: string = await this.generateReference();
    // if (await CheckUniqueReference(generatedReference) == true) {
    //   await this.IncremenetRefernce();
    // }

    // this.creationForm.controls['reference'].setValue(await this.generateReference());
    //set the defaults values from the configuration
    this.creationForm.controls['note'].setValue(this.defaultsValues['note_facture']);
    this.creationForm.controls['conditionRegelement'].setValue(this.defaultsValues['conditions_facture']);
    this.creationForm.controls['object'].setValue(this.defaultsValues['objet_facture']);
    if (this.defaultsValues.validite_facture) {
      var dateToday = new Date();
      dateToday.setDate(dateToday.getDate() + parseInt(this.defaultsValues.validite_facture.toString()));
      this.creationForm.controls['dateEcheance'].setValue(dateToday);

    }
  }

  /**
   * return the defaults values from the configuration
   */
  getDefaultsValues(): Promise<ParametrageContenuDevis> {
    return new Promise((resolve, reject) => {
      if (this.defaultsValues != null) {
        resolve(this.defaultsValues);
      } else {
        this.paramteresService.Get(TypeParametrage.parametrageDevis)
          .subscribe((response: Parametrage) => {
            resolve(response != null ? (JSON.parse(response.contenu) as ParametrageContenuDevis) : new ParametrageContenuDevis());
          }, error => reject(error));
      }
    });
  }

  checkFormIsValid(): boolean {
    (this.creationForm.valid)
    let valid = true;
    for (let key in this.creationForm.controls) {
      if (this.creationForm.controls[key].errors != null) {
        valid = false;
      }
    }
    return valid;
  }

  CheckUniqueReference(value): Promise<any> {
    return new Promise((resolve, reject) => {
      this.factureService.CheckUniqueReference(value).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  async GetUniqueReference() {
    // Check Unique Reference
    let generatedReference: string = await this.generateReference();
    if (await this.CheckUniqueReference(generatedReference) == true) {
      await this.IncremenetRefernce();
      generatedReference = await this.generateReference();
    }
    return generatedReference;
  }

  loadChantierInformation(idChantier): Promise<void> {
    debugger

    return new Promise(async (reslove, reject) => {
      if (idChantier == null) {
        this.creationForm.controls["adresseFacturation"].setValue(null);
        this.creationForm.controls["client"].setValue(null);
      } else {
        // this.idChantier = idChantier;
        const chantier = await this.getChantier(idChantier);
        // this.creationForm.controls['idChantier'].setValue(chantier.nom);
        // const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
        //const { idClient } = chantier;
        // const client = await this.getclientById(idClient);
        try {
          this.creationForm.controls["client"].setValue('client');
          this.creationForm.controls["client"].setValue(chantier.client);
        } catch (ex) {
          // console.log(ex);
        }
        const defaultAdresse = JSON.parse(chantier.client.adresses) as Adresse[];
        const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
        if (!adresseIntervention) reslove();
        this.creationForm.controls["adresseFacturation"].setValue(adresseIntervention);

      }
      reslove();

    });

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

  sloadChantierInformation(idChantier): Promise<void> {

    return new Promise(async (reslove, reject) => {
      if (idChantier == null) {
        this.creationForm.controls["adresseFacturation"].setValue(null);
        this.creationForm.controls["client"].setValue(null);
      } else {
        const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
        const { idClient } = chantier;
        const client = await this.getclientById(idClient);
        console.log(this.creationForm.controls["client"])
        try {
          this.creationForm.controls["client"].setValue('client');
          this.creationForm.controls["client"].setValue(client);
        } catch (ex) {
          console.log(ex);
        }
        const defaultAdresse = JSON.parse(client.adresses) as Adresse[];
        const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
        if (!adresseIntervention) reslove();
        this.creationForm.controls["adresseFacturation"].setValue(adresseIntervention);

      }
      reslove();
    });
  }

  setPrestations() {
    return [];
  }

  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave(res => {
        resolve(res);
      });
    });
  }

  createBodyRequest(status): Facture {
    const formValue = this.creationForm.value;
    const facture: Facture = new Facture();
    facture.reference = formValue.reference;
    //facture.dateCreation = new Date();
    facture.idChantier = formValue.idChantier;
    if (this.idChantier != null) {
      facture.idChantier = this.idChantier;
    } else {
      facture.idChantier = formValue.idChantier;
    }
    //region : ajout des informations du client
    const client: Client = formValue.client
    facture.idClient = client.id;

    if (this.idChantier == null && facture.idClient == undefined) {
      facture.idClient = this.datafacture.idClient;
      facture.infoClient = this.datafacture.infoClient;
    } else {
      let infoClient: infoClientModel = new infoClientModel();
      infoClient.codeClient = client.codeclient;
      infoClient.nom = client.nom;
      infoClient.adresseFacturation = formValue.adresseFacturation;
      facture.infoClient = JSON.stringify(infoClient);
    }

    //end region
    facture.status = status;
    facture.typeFacture = TypeFacture.Generale;
    facture.emails = '[]';
    facture.memos = '[]';
    facture.dateCreation = AppSettings.formaterDatetime(formValue.dateCreation);
    facture.dateEcheance = AppSettings.formaterDatetime(formValue.dateEcheance);
    facture.object = formValue.object;
    facture.note = formValue.note;
    facture.conditionRegelement = formValue.conditionRegelement;
    facture.prestations = this.prestations.prestation;
    facture.tva = this.prestations.tva;
    facture.remise = this.prestations.remise;
    facture.typeRemise = this.prestations.typeRemise;
    facture.prorata = this.prestations.prorata;
    facture.puc = this.prestations.puc;
    facture.totalHt = this.prestations.totalHt;
    facture.total = this.prestations.totalTtc;
    facture.tvaGlobal = this.prestations.tvaGlobal;
    facture.retenueGarantie = this.prestations.retenueGarantie;
    facture.delaiGarantie = this.prestations.delaiGarantie;
    facture.statusGarantie = StatutRetenueGarantie.encours;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    facture.historique = JSON.stringify([historique]);
    facture.idDevis = this.idDevis
    return facture;
  }

  checkValiddelaiGarantie(retenueGarantie, delaiGarantie) {
    if (retenueGarantie != 1 && retenueGarantie != null && delaiGarantie == null) {
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
  async add(statut) {
    this.prestations = await this.getDataFromArticlesComponet();

    if (!this.checkValiddelaiGarantie(this.prestations.retenueGarantie, this.prestations.delaiGarantie)) {
      return
    }

    // if(.)
    if (this.checkFormIsValid() && this.prestations.prestation != "[]") {
      const createBody = this.createBodyRequest(statut);
      this.factureService.Add(createBody, this.idFicheIntervention).subscribe(
        res => {
          if (res) {
            this.translate.get('addFacture').subscribe(text => {
              this.processing = true;
              this.IncremenetRefernce();
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.navigateToDetailBonCommande(res.id);
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

  get f() { return this.creationForm.controls; }

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

  navigateToDetailBonCommande(id) {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation/detail/${id}` : `/factures/detail/${id}`;
    this.router.navigate([url]);
  }

  navigateToBonCommandeList() {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation/` : `/factures`;
    this.router.navigate([url]);
  }
}
