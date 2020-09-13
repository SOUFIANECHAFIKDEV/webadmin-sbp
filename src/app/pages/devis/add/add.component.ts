import { Component, OnInit } from '@angular/core';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Chantier } from 'app/Models/Entities/Chantier';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Adresse } from 'app/Models/Entities/Adresse';
import { DevisService } from 'app/services/devis/devis.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { Parametrage, ParametrageContenuDevis } from 'app/Models/Entities/Numerotation';
import { Client } from 'app/Models/Entities/Client';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { IFormType } from 'app/Enums/IFormType.enum';
import { Devis } from 'app/Models/Entities/Devis';
import { Historique } from 'app/Models/Entities/Historique';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { ClientService } from 'app/services/client/client.service';
import * as _ from 'lodash';

declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  chantiers: Chantier[] = [];
  creationForm: any = null;
  typeDevis: string = "complet";
  idChantier: number = null;
  processing: boolean = false;
  adresses: Adresse[] = [];
  newAddress: Adresse[] = [];
  emitter: any = {};
  actionHistorique: ActionHistorique = new ActionHistorique();
  statutDevis: typeof StatutDevis = StatutDevis
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    translate: 'yes',
  }
  formConfig = {
    type: IFormType.add,
    defaultData: null
  }


  constructor(
    private paramteresService: ParameteresService,
    private chantierService: ChantierService,
    private formBuilder: FormBuilder,
    private devisService: DevisService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private clientService: ClientService,
    private router: Router,
  ) { }


  /*---------------------------------------------------------------*/
  /**
   * initialisations of the component 
   */
  /*---------------------------------------------------------------*/

  async ngOnInit() {

    this.processing = true;

    //set the language used in the component
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    this.idChantier = await this.getParamsFromRoute("idChantier") as number;

    //build the creation Form
    this.buildCreationForm();

    //initialize the creation Form
    await this.initializeCreationForm();

    this.processing = false;
  }



  /**
  * build the creation Form
  */
  buildCreationForm(): void {
    this.creationForm = this.formBuilder.group({
      reference: ["", [Validators.required], this.CheckUniqueReference.bind(this)],
      objet: [null],
      conditionReglement: [null],
      note: [null],
      idChantier: [null, [Validators.required]],
      idclient: [null, [Validators.required]],
      adresseIntervention: [null, [Validators.required]],
      adresseFacturation: [null, [Validators.required]]
    });
  }

  /**
   * initialize the creation Form
   */
  async initializeCreationForm() {
    // set reference for the new insertion
    this.creationForm.controls['reference'].setValue(await this.generateReference());
    //set the defaults values from the configuration
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultsValues();
    this.creationForm.controls['note'].setValue(defaultsValues['note']);
    this.creationForm.controls['conditionReglement'].setValue(defaultsValues['conditions']);
    this.creationForm.controls['objet'].setValue(defaultsValues['objet']);

    if (this.idChantier != null) {
      this.creationForm.controls['idChantier'].setValue(this.idChantier.toString());
      //get the list of 'chantier'
      this.chantiers.push(await this.getChantierById(this.idChantier));
      await this.loadChantierClient(this.idChantier);
    }
  }


  getChantierById(idChantier: number): Promise<Chantier> {
    return new Promise((resolve, reject) => {
      this.chantierService.Get(idChantier)
        .subscribe(
          res => resolve(res),
          error => reject(error)
        )
    });
  }

  /**
   * return a reference for the new insertion
   */
  generateReference(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Generate(TypeNumerotation.devis as number)
        .subscribe(response => {
          resolve(response['data']);
        }, (error) => reject(error));
    });
  }

  /**
   * check if is the frist loading
   */
  async fristLoading() {
    if (this.chantiers.length == 0) {
      this.processing = true;
      this.chantiers = await this.getChantiers('');
      this.processing = false;
    }
  }
  /**
   * return a list of 'chantier'
   */

  getChantiers(search: string): Promise<Chantier[]> {
    return new Promise((resolve, reject) => {
      this.chantierService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
        .subscribe(
          res => resolve(res.list),
          error => reject(error)
        )
    });
  }

  /**
   * check if the reference is unique or not
   * @param control the input that we want to check its value
   */
  CheckUniqueReference(control: FormControl): Promise<any | null> {
    let promise = new Promise((resolve, reject) => {
      this.devisService.CheckUniqueReference(control.value)
        .subscribe(res =>
          res ? resolve({ CheckUniqueReference: true }) : resolve(null),
          error => reject(error)
        )
    });
    return promise;
  }

  /**
   * return the type of the document
   */
  getParamsFromRoute(paramName: string): Promise<string | number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params[paramName]))
    });
  }

  // getIdChantier(): Promise<number> {
  //   return new Promise((resolve, reject) => {
  //     this.route.params.subscribe(params => resolve(params["idChantier"] params["type"] getParamsFromRoute))
  //   });
  // }

  /**
   * return the defaults values from the configuration
   */
  getDefaultsValues(): Promise<ParametrageContenuDevis> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Get(TypeParametrage.parametrageDevis)
        .subscribe((response: Parametrage) => {
          resolve(response != null ? (JSON.parse(response.contenu) as ParametrageContenuDevis) : new ParametrageContenuDevis());
        }, error => reject(error));
    });
  }

  /*---------------------------------------------------------------*/
  /**
   * reactive functions
   */
  /*---------------------------------------------------------------*/

  /**
   * load Chantier Client information
   * @param idChantier 
   */
  async loadChantierClient(idChantier): Promise<void> {

    const chantierInfos = this.chantiers.filter(chantier => chantier.id == idChantier)[0];
    let client = chantierInfos == undefined ? null : (chantierInfos['client'] != null ? chantierInfos['client'] : (await this.getClientById(chantierInfos['idClient'])));
    this.setClientInfoInCreationForm(client);
  }

  getClientById(idClient: number): Promise<Client> {
    return new Promise((reslove, reject) => {
      this.clientService.Get(idClient).subscribe(res => {
        reslove(res);
      }, async  err => {
        const translation = await this.getTranslationByKey("errors");
        toastr.danger('', translation.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        reslove(null);
      });
    });
  }

  setClientInfoInCreationForm(client: Client): void {
    if (client == null) {
      this.adresses = [];
      this.creationForm.controls["idclient"].setValue(null);
      this.creationForm.controls["adresseIntervention"].setValue(null);
      this.creationForm.controls["adresseFacturation"].setValue(null);
      return;
    } else {
      this.creationForm.controls["idclient"].setValue(null);
      this.creationForm.controls["idclient"].setValue(client);
      const adresses: Adresse[] = (JSON.parse(client.adresses) as Adresse[]);
      this.adresses = adresses == null ? [] : adresses;
      let adresseFacturation: Adresse[] = JSON.parse(client.adresses) as Adresse[];
      this.creationForm.controls["adresseFacturation"].setValue(null);
      this.creationForm.controls["adresseFacturation"].setValue(adresseFacturation.filter(A => A.default == true)[0]);
    };
  }

  /**
   * get New Address
   * @param adresses list of the New Address
   */
  setNewAddress(adresses: Adresse[]) {
    //get last added address
    const adresse = adresses[(adresses.length - 1)];
    //push the new address to the new addresses list
    this.newAddress.unshift(adresse);
    adresse.default = false;
    //fill form field by the new address
    this.creationForm.controls["adresseIntervention"].setValue(adresse);
  }

  /**
   * add New Chantier
   */
  addNewChantier(chantier) {


    this.chantierService.Add(chantier).subscribe(async response => {
      this.processing = true;
      this.chantiers.unshift(response);
      this.creationForm.controls["idChantier"].setValue(response.id.toString());
      this.chantiers = await this.getChantiers('');
      await this.loadChantierClient(response.id);
      const translation = await this.getTranslationByKey("addchantier");
      toastr.success(translation.msg, translation.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    }, async err => {
      const translation = await this.getTranslationByKey("errors");
      toastr.danger('', translation.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    }, () => {
      jQuery("#Model").modal("hide");
      this.processing = false;
    });
  }

  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave((res) => {
        resolve(res);
      })
    })
  }

  getDataFromArticlesMinimaliste(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getData((res) => {
        resolve(res);
      })
    })
  }

  async  createCompletBodyRequest() {

    return new Promise(async (reslove, reject) => {
      let values: Devis = this.creationForm.value;
      values = AppSettings.ConvertEmptyValueToNull(values);

      //ajouter les inforamtions des articles
      let dataArticles = await this.getDataFromArticlesComponet();
      if (dataArticles.prestation == "[]") {
        reslove(null);
      }
      if (!this.checkValiddelaiGarantie(dataArticles.retenueGarantie, dataArticles.delaiGarantie)) {
        this.processing = false;
        return

      }

      values["prestation"] = dataArticles.prestation;
      values['totalHt'] = dataArticles.totalHt;
      values['total'] = dataArticles.totalTtc;
      values['tva'] = dataArticles.tva;
      values['remise'] = dataArticles.remise;
      values['typeRemise'] = dataArticles.typeRemise;
      values['puc'] = dataArticles.puc;
      values['retenueGarantie'] = dataArticles.retenueGarantie;
      values['delaiGarantie'] = dataArticles.delaiGarantie;
      values['prorata'] = dataArticles.prorata;
      values['tvaGlobal'] = dataArticles.tvaGlobal;

      //ajouter les info supplémentaire
      values['status'] = this.statutDevis.EnAttente;
      values['objet'] = values.objet;
      values['conditionReglement'] = values.conditionReglement;
      values['note'] = values.note;
      values['adresseFacturation'] = JSON.stringify(values.adresseFacturation);
      values['idChantier'] = values.idChantier;
      let adresseIntervention: any = values.adresseIntervention;
      if (adresseIntervention.designation == undefined) {
        adresseIntervention = JSON.stringify(this.adresses[parseInt(adresseIntervention)]);
      } else {
        adresseIntervention = JSON.stringify(values.adresseIntervention);
      }
      values['adresseIntervention'] = adresseIntervention;
      await this.addAdresseToClient(adresseIntervention);

      values.emails = JSON.stringify([]);
      values.devisExel = null;
      values["historique"] = this.createHistorique();

      reslove(values)
    });

  }

  addAdresseToClient(nouveauAdresses: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const adresse = this.newAddress.filter(a => _.isEqual(a, JSON.parse(nouveauAdresses)));
      if (adresse.length != 0) {
        const client = this.creationForm.value.idclient;
        let a = JSON.parse(client.adresses);
        a.push(JSON.parse(nouveauAdresses))
        client.adresses = JSON.stringify(a);
        this.clientService.Update(client.id, client).subscribe(
          res => { resolve() }, err => reject());
      } else {
        resolve();
      }
    });
  }


  createMinimalistBodyRequest() {
    return new Promise(async (reslove, reject) => {
      let values: Devis = this.creationForm.value;
      values = AppSettings.ConvertEmptyValueToNull(values);

      //ajouter les inforamtions des articles
      let dataArticles = await this.getDataFromArticlesMinimaliste();
      values["prestation"] = null;
      values['totalHt'] = dataArticles.totalHt;
      debugger
      values['total'] = dataArticles.totalHt * ((parseInt(dataArticles.data.tva) / 100) + 1);
      values['tva'] = dataArticles.data.tva;
      values['remise'] = 0;
      values['typeRemise'] = null;
      values['puc'] = dataArticles.data.puc;
      values['retenueGarantie'] = dataArticles.retenueGarantie;
      values['delaiGarantie'] = dataArticles.delaiGarantie;
      values['prorata'] = dataArticles.data.prorata;

      values['nomberHeure'] = dataArticles.data.nomber_heure;
      values['coutVente'] = dataArticles.data.cout_vente;
      values['coutMateriel'] = dataArticles.data.cout_materiel;
      values['achatMateriel'] = dataArticles.data.achat_materiel;

      //ajouter les info supplémentaire
      values['status'] = this.statutDevis.EnAttente;
      values['objet'] = values.objet;
      values['conditionReglement'] = values.conditionReglement;
      values['note'] = values.note;
      values['adresseFacturation'] = JSON.stringify(values.adresseFacturation);
      values['idChantier'] = values.idChantier;

      let adresseIntervention: any = values.adresseIntervention;
      if (adresseIntervention.designation == undefined) {
        adresseIntervention = JSON.stringify(this.adresses[parseInt(adresseIntervention)]);
      } else {
        adresseIntervention = JSON.stringify(values.adresseIntervention);
      }
      values['adresseIntervention'] = adresseIntervention;
      await this.addAdresseToClient(adresseIntervention);

      values.emails = JSON.stringify([]);
      values.devisExel = JSON.stringify(dataArticles.data.devisExel);
      values["historique"] = this.createHistorique();
      reslove(values);
    });
  }

  createHistorique() {
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    return JSON.stringify([historique]);
  }

  async checkIfValidation(): Promise<boolean> {
    const condition = this.typeDevis == 'minimaliste' ? (await this.getDataFromArticlesMinimaliste()) != false : true;
    return (this.creationForm.valid && condition);
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
  async add() {
    debugger
    this.processing = true;
    if (await this.checkIfValidation() == false) {
      const translation = await this.getTranslationByKey('errors');
      toastr.warning(translation.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      this.processing = false;
      return;
    }
    let bodyRequest = null;
    if (this.typeDevis == 'complet') {
      bodyRequest = await this.createCompletBodyRequest();
      if (bodyRequest == null) {
        const translation = await this.getTranslationByKey('errors');
        toastr.warning(translation.articleRequired, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        this.processing = false;
        return
      }
    } else if (this.typeDevis == 'minimaliste') {
      bodyRequest = await this.createMinimalistBodyRequest();
    }
    await this.insertDevis(bodyRequest);
  }

  insertDevis(bodyRequest): Promise<Devis> {
    return new Promise((resolve, reject) => {
      this.devisService.Add(bodyRequest).subscribe(async res => {
        await this.IncremenetRefernce();
        const translation = await this.getTranslationByKey('addDevis');
        toastr.success(translation.msg, translation.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        if (this.idChantier == null) {
          this.router.navigate(["/devis/detail", res.id]);
        } else {
          this.router.navigate([`/chantiers/${this.idChantier}/documents/devis/detail/${res.id}`]);
        }
        // 

        this.processing = false;
        resolve();
      }, async err => {
        const translation = await this.getTranslationByKey('errors');
        toastr.warning(translation.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        this.processing = false;
        resolve();
      });
    })
  }

  IncremenetRefernce(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Increment(TypeNumerotation.devis as number)
        .subscribe(res => resolve(res), err => reject(err))
    });
  }



  /*---------------------------------------------------------------*/
  /**
   * helpers
   */
  /*---------------------------------------------------------------*/

  get f() { return this.creationForm.controls; }

  /**
   * get translation By Key
   */
  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation)
      });
    });
  }

  goBack(): void {
    let url = this.idChantier ? `/chantiers/${this.idChantier}/documents/devis` : '/devis';
    this.router.navigate([url]);
  }

  navigateToDevisList(): void {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/devis` : `/devis`;
    this.router.navigate([url]);
  }
}
