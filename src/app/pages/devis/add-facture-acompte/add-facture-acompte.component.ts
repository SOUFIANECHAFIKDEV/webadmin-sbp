import { Component, OnInit } from '@angular/core';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from 'app/services/facture/facture.service';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { Historique } from 'app/Models/Entities/Historique';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { Facture } from 'app/Models/Entities/Facture';
import { Adresse } from 'app/Models/Entities/Adresse';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { ParametrageContenuDevis, Parametrage } from 'app/Models/Entities/Numerotation';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { DevisService } from 'app/services/devis/devis.service';
import { Devis, FactureAcomptesDevis } from 'app/Models/Entities/Devis';
import { infoClientModel } from 'app/Models/Entities/Avoir';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';
declare var toastr: any;

@Component({
  selector: 'app-add-facture-acompte',
  templateUrl: './add-facture-acompte.component.html',
  styleUrls: ['./add-facture-acompte.component.scss']
})

export class AddFactureAcompteComponent implements OnInit {
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  statutAvoir: typeof StatutAvoir = StatutAvoir;
  statutFacture: typeof StatutFacture = StatutFacture;
  actionHistorique: ActionHistorique = new ActionHistorique();
  prestations: any;
  tva: any;
  editorConfig: AngularEditorConfig = { editable: true, spellcheck: true, height: '8rem', translate: 'yes', };
  chantierPreDefini = null;
  dateLang: any;
  emitter: any = {};
  remise = 0;
  typeRemise = '€';
  puc = 0;
  prorata = 0;
  retenueGarantie = 0;
  delaiGarantie = 0;
  idicheIntervention
  idFichesTravail;
  loading;
  reference: FactureReferenceModel;
  datafacture;
  idDevis = null;
  processing: boolean = false;
  creationForm: any = null;
  devisInfos: Devis = new Devis();
  adresseFacturation: Adresse;
  idChantier: number = null
  constructor(
    private translate: TranslateService,
    private paramteresService: ParameteresService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private factureService: FactureService,
    private loginService: LoginService,
    private router: Router,
    private devisService: DevisService,
  ) { }

  /*---------------------------------------------------------------*/
  /**
   * initialisations of the component 
   */
  /*---------------------------------------------------------------*/
  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => this.dateLang = text);
    this.buildCreationForm();
    await this.initializeCreationForm();
    this.route.params.subscribe(async params => {
      this.devisInfos = await this.getDevisById(params["id"]);
      this.adresseFacturation = JSON.parse(this.devisInfos.adresseFacturation) as Adresse;
      await this.setDefaultValueFacture();
    });
    this.idChantier = await this.getParamsFromRoute("idChantier") as number;
    this.processing = false;
  }

  /**
   * return the type of the document
   */
  getParamsFromRoute(paramName: string): Promise<string | number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params[paramName]))
    });
  }

  /**
  * @description build the creation Form
  */
  buildCreationForm(): void {
    this.creationForm = this.formBuilder.group({
      reference: [null, [Validators.required]],
      dateCreation: [new Date(), [Validators.required]],
      dateEcheance: [null, [Validators.required]],
      object: [],
      note: [],
      conditionRegelement: [],
      client: [null],
      pourcentage: [null, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  /**
  * @description return default date Echeance 
  */
  async setdateEcheance() {
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultsValues();
    var dateToday = new Date();
    if (defaultsValues.validite_facture != null && defaultsValues.validite_facture != '') {
      dateToday.setDate(dateToday.getDate() + parseInt(defaultsValues.validite_facture.toString()));
    }
    this.creationForm.controls['dateEcheance'].setValue(dateToday)
  }

  /**
  * @description initialize the creation Form
  */
  async initializeCreationForm(): Promise<void> {
    //set the defaults values from the configuration
    this.creationForm.controls['reference'].setValue(await this.generateReference());
    this.creationForm.controls['dateCreation'].setValue(new Date);
    this.setdateEcheance();
  }

  /**
   * @description return a reference for the new insertion
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
   * @description return the defaults values from the configuration
   */
  async setDefaultValueFacture() {
    this.creationForm.controls['reference'].setValue(await this.generateReference());
    //set the defaults values from the configuration
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultsValues();
    this.creationForm.controls['note'].setValue(defaultsValues['note_facture']);
    this.creationForm.controls['conditionRegelement'].setValue(defaultsValues['conditions_facture']);
    this.creationForm.controls['object'].setValue(defaultsValues['objet_facture']);
    //set default date validite
    if (defaultsValues.validite_facture) {
      var dateToday = new Date();
      dateToday.setDate(dateToday.getDate() + parseInt(defaultsValues.validite_facture.toString()));
      this.creationForm.controls['dateEcheance'].setValue(dateToday);
    }
  }

  /**
   * @description return the defaults values from the configuration
   */
  getDefaultsValues(): Promise<ParametrageContenuDevis> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Get(TypeParametrage.parametrageDevis)
        .subscribe((response: Parametrage) => {
          resolve(response != null ? (JSON.parse(response.contenu) as ParametrageContenuDevis) : new ParametrageContenuDevis());
        }, error => reject(error));
    });
  }

  checkFormIsValid(statut: StatutFacture): boolean {
    (this.creationForm.valid)
    let valid = true;
    for (let key in this.creationForm.controls) {
      if (
        this.creationForm.controls[key].errors != null
        &&
        (statut != this.statutFacture.Cloture || (key != 'pourcentage' && statut == this.statutFacture.Cloture))
      ) {
        valid = false;
      }
    }
    return valid;
    //((key != 'pourcentage' && statut == this.statutFacture.Cloture) ||  statut != this.statutFacture.Cloture) 
    //key == 'p' 
  }

  // /**
  // * check if the reference is unique or not
  // * @param control the input that we want to check its value
  // */
  // CheckUniqueReference(control: FormControl): Promise<any | null> {
  //   let promise = new Promise((resolve, reject) => {
  //     this.factureService.CheckUniqueReference(control.value)
  //       .subscribe(res =>
  //         res ? resolve({ CheckUniqueReference: true }) : resolve(null),
  //         error => reject(error)
  //       )
  //   });
  //   return promise;
  // }

  // CheckUniqueIsReference(control: FormControl) {
  //   let promise = new Promise((resolve, reject) => {
  //     this.factureService.CheckUniqueReference(control.value).subscribe(res => {
  //       if (res == true) {
  //         resolve({ CheckUniqueReference: true });
  //       } else {
  //         resolve(null);
  //       }
  //     });
  //   });
  //   return promise;
  // }

  getStatutTosave(status: StatutFacture, resteAPayer): StatutFacture {
    // Brouillon Cloture Encours
    if (status == this.statutFacture.Encours) {
      if (resteAPayer == 0) {
        return this.statutFacture.Cloture;
      } else {
        return this.statutFacture.Encours;
      }
    } else if (status == this.statutFacture.Cloture || status == this.statutFacture.Brouillon) {
      return status;
    }
  }

  calcTotalHtToSave(status: StatutFacture, prestationTotalHt: number): number {
    if (status == this.statutFacture.Cloture) {
      const acomptes = JSON.parse(this.devisInfos.acomptes) as { idFacture: number, pourcentage: number, resteAPayer: number }[];
      return (acomptes.length == 0) ? this.devisInfos.totalHt : (acomptes[acomptes.length - 1].resteAPayer);
    } else {
      return prestationTotalHt;
    }
  }

  calcTotalTtcToSave(status: StatutFacture, prestationTotalTtc: number, totalHt: number, tva: number) {
    if (status == this.statutFacture.Cloture) {
      return totalHt * ((tva / 100) + 1)
    } else {
      return prestationTotalTtc;
    }
  }



  getDevisById(idDevis: number): Promise<Devis> {
    return new Promise((resolve, reject) => {
      this.devisService.Get(idDevis).subscribe(response => {
        resolve(response);
      });
    });
  }

  /*---------------------------------------------------------------*/
  /**
   * @section  Logique de sauvegarde des données
   */
  /*---------------------------------------------------------------*/

  /**
   * @description la fonction principale pour sauvegarder la nouvelle facture
   * @param statut statut du facture qui on veut sauvegarder (cloture/brouillon/en cours)
   */
  async add(statut: StatutFacture) {

    //afficher l'animation de chargement des données
    this.processing = true;
    //vérifier si tous les champs obligatoir est remplie
    if (!this.checkFormIsValid(statut)) {
      //récupère la traduction des messages d'erreurs
      const translatation = await this.getTranslateByKey('errors');
      //afficher un message d'erreur
      toastr.warning(translatation.fillAll, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center', });
      //cacher l'animation de chargement des données
      this.processing = false;
      //sortir de la fonction
      return;
    }
    //création le corp de la requête du creation
    const facturecreationBody = await this.createBodyRequest(statut);
    //send request to the server
    this.factureService.CreateFactureAcomptes(facturecreationBody).subscribe(
      async res => {
        if (res) {

          //incrémenter la référence
          this.IncremenetRefernce();
          //récupère la traduction des messages d'ajout
          const translatation = await this.getTranslateByKey('addFacture');
          //affcihe un message du succès
          toastr.success(translatation.msg, translatation.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          //redirigé au detail de la nouvelle insertion
          this.navigateToDevisDetail();

        } else {
          //récupère la traduction des messages d'erreurs
          const translatation = await this.getTranslateByKey('errors');
          toastr.warning(translatation.serveur, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center', });
        }
      },
      async err => {
        //récupère la traduction des messages d'erreurs
        const translatation = await this.getTranslateByKey('errors');
        toastr.warning(translatation.serveur, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center', });
      }, () => {
        //cacher l'animation de chargement des données
        this.processing = false;
      });
  }

  getDataFromArticlesComponet(status: StatutFacture, ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave(status, res => {

        resolve(res);
      });
    });
  }

  async createBodyRequest(status: StatutFacture): Promise<any> {

    this.prestations = await this.getDataFromArticlesComponet(status);
    const formValue = this.creationForm.value;
    const facture: Facture = new Facture();
    facture.reference = formValue.reference;
    facture.dateCreation = new Date();
    facture.idChantier = this.devisInfos.chantier.id;
    facture.status = this.getStatutTosave(status, this.prestations.resteAPayerTTC);
    facture.typeFacture = TypeFacture.Acompte;
    facture.emails = '[]';
    facture.memos = '[]';

    facture.dateCreation = formValue.dateCreation;
    facture.dateEcheance = formValue.dateEcheance;
    facture.object = formValue.object;
    facture.note = formValue.note;
    facture.idClient = this.devisInfos.chantier.client.id;

    let infoClient: infoClientModel = new infoClientModel();
    infoClient.codeClient = this.devisInfos.chantier.client.codeclient;
    infoClient.nom = this.devisInfos.chantier.client.nom;
    infoClient.adresseFacturation = (JSON.parse(this.devisInfos.chantier.client.adresses) as Adresse[]).filter(x => x.default === true)[0];
    facture.infoClient = JSON.stringify(infoClient);


    facture.conditionRegelement = formValue.conditionRegelement;
    const pourcentage = (status == this.statutFacture.Cloture) ? 100 : this.creationForm.value.pourcentage;
    this.prestations.prestations.description = "Acomptes  d'avencement" + pourcentage + " % sur le devis " + this.devisInfos.reference;
    facture.prestations = JSON.stringify(this.prestations.prestations);
    facture.remise = 0;
    facture.typeRemise = '€';
    facture.retenueGarantie = this.prestations.retenueGarantie;
    facture.delaiGarantie = this.prestations.delaiGarantie;
    facture.statusGarantie = StatutRetenueGarantie.encours;
    //facture.tva = /*this.prestations.tva*/null;
    facture.prorata = this.prestations.prorata;
    facture.puc = this.prestations.puc;
    facture.idDevis = this.devisInfos.id
    facture.totalHt = this.prestations.totalHt;
    facture.total = this.prestations.totalTtc;
    facture.tvaGlobal = null;
    facture.tva = JSON.stringify([{ "tva": this.prestations.tva, "totalHT": facture.totalHt, "totalTVA": facture.total - facture.totalHt, "totalTTC": facture.total }]);
    facture.tvaGlobal = this.prestations.tva
    facture.historique = this.createHistorique();
    return {
      idDevis: this.devisInfos.id,
      acomptes: this.createFacturesAcomptesInfos(status, pourcentage),
      facture: facture
    }
  }

  createFacturesAcomptesInfos(status, pourcentage): FactureAcomptesDevis {
    const resteAayer = (): number => {
      if (status != this.statutFacture.Cloture) {
        return parseFloat((((this.prestations.resteAPayerTTC == undefined ? 0 : this.prestations.resteAPayerTTC) as number).toFixed(2)))
      } else {
        return 0;
      }
    }
    return {
      pourcentage: pourcentage,
      resteAPayer: resteAayer(),
      resteAPayerHT: this.prestations.resteAPayerHT,
      acomptesCumulleeHT: this.prestations.acomptesCumulleeHT,
      acomptesCumulleeTTC: this.prestations.acomptesCumulleeTTC
    };
  }

  createHistorique(): string {
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    return JSON.stringify([historique]);
  }

  IncremenetRefernce() {
    this.paramteresService.Increment(this.typeNumerotation.facture as number).subscribe(res => { });
  }

  /*---------------------------------------------------------------*/
  /**
   * @section  fonctions d'aide
   */
  /*---------------------------------------------------------------*/
  getTranslateByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translatation => {
        resolve(translatation);
      });
    });
  }

  navigateToDevisList() {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => {
        const idChantier: number = params['idChantier'];
        const idDevis: number = params['id'];
        let url = idChantier != null ? `/chantiers/${idChantier}/documents/devis/detail/${idDevis}` : `/devis`;
        this.router.navigate([url]);
      });
    });
  }

  get f() {
    return this.creationForm.controls;
  }
  navigateToDevisDetail() {
    if (this.idChantier == null) {
      this.router.navigate([`/devis/detail/${this.devisInfos.id}`],
        {

          queryParams: {
            "section": "factureAcompte",
          }
        });
    } else {
      this.router.navigate([`/chantiers/${this.idChantier}/documents/devis/detail/${this.devisInfos.id}`],
        {
          queryParams: {
            "section": "factureAcompte",
          }
        });
    }
  }
}