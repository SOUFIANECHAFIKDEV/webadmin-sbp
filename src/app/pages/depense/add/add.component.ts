import { Component, OnInit } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { StatutDepense } from 'app/Enums/StatutDepense.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Validators, FormBuilder } from '@angular/forms';
import { Depense } from 'app/Models/Entities/depense';
import { Historique } from 'app/Models/Entities/Historique';
import { DepenseService } from 'app/services/depense/depense.service';
import { CreateDepense, DepenseState } from '../depenseState';
import { DepenseBonCommandeFournisseur } from 'app/Models/Entities/depenseBonCommandeFournisseur';
import { ParametrageContenuDevis, Parametrage } from 'app/Models/Entities/Numerotation';

import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';

declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  chantiers: Chantier[] = []
  fournisseurs: Fournisseur[] = []
  creationForm: any = null;
  processing: boolean = false;
  actionHistorique: ActionHistorique = new ActionHistorique();
  statutDepense: typeof StatutDepense = StatutDepense
  dateLang: any;
  articles: any;
  emitter: any = {};
  dataDepense
  idsBonCommandeFournisseur: null
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    //placeholder: 'Enter text here...',
    translate: 'yes',
  };
  typeOfAddition: CreateDepense = null;
  createDepense: typeof CreateDepense = CreateDepense;

  constructor(
    private paramteresService: ParameteresService,
    private chantierService: ChantierService,
    private fournisseurService: FournisseurService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private router: Router,
    private formBuilder: FormBuilder,
    private depenseService: DepenseService,
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
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });

    //build the creation Form
    this.buildCreationForm();

    //initialize the creation Form
    await this.initializeCreationForm();

    //get the list of 'chantier'
    await this.getChantiers('');
    //get list of 'fournisseur'
    await this.getFournisseurs('');

    this.route.params.subscribe(async params => {
      this.typeOfAddition = params["id"];
      if (params["id"] == CreateDepense.DUPLIQUER) {
        this.dataDepenseDuplique(params);
      } else {
        await this.setDefaultValueDepense();
      }
    }
    );

    this.route.params.subscribe(async params => {
      if (params["id"] == CreateDepense.Bon_Commande_Fournisseur) {


        this.dataDepenseBonCommandeFournisseur(params);
      } else {
        await this.setDefaultValueDepense();
      }
    }
    );
    this.processing = false;
  }
  /**
  * Create depense  from dupliquer
  * @param params 
  */
  dataDepenseDuplique(params) {

    this.dataDepense = DepenseState.depense;
    this.dataDepense = DepenseState.depense;
    this.setData(params["id"], this.dataDepense)
    this.getChantiersData('', this.dataDepense.idChantier);
    this.getFournisseursData('', this.dataDepense.idFournisseur);
  }

  /**
   * Create depense depuis BC Fournisseur
   */
  dataDepenseBonCommandeFournisseur(params) {
    debugger
    this.dataDepense = DepenseState.depense;
    this.idsBonCommandeFournisseur = DepenseState.idBonCommandeFournisseur;
    this.setData(params["id"], this.dataDepense)
    this.getChantiersData('', this.dataDepense.idChantier);
    this.getFournisseursData('', this.dataDepense.idFournisseur);
  }
  /**
 *  return the defaults values from the configuration
 */
  async setData(number, data) {
    debugger
    if (number == CreateDepense.DUPLIQUER && data != null) {
      let depense = data as Depense;
      this.creationForm.controls['categorie'].setValue(this.dataDepense.categorie);
      this.articles = JSON.parse(depense.prestations);
      this.creationForm.controls['objet'].setValue(this.dataDepense.objet);
      this.creationForm.controls['note'].setValue(this.dataDepense.note);
      this.creationForm.controls['conditionRegelement'].setValue(this.dataDepense.conditionsReglement);

    }
    if (number == CreateDepense.Bon_Commande_Fournisseur && data != null) {
      let depense = data as Depense;
      this.articles = JSON.parse(depense.prestations);
    }
  }

  /***
   * return the defaults values 
   */
  async setDefaultValueDepense() {
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultValues();
    this.creationForm.controls['note'].setValue(defaultsValues['note_depense']);
    this.creationForm.controls['conditionRegelement'].setValue(defaultsValues['conditions_depense'])
    this.creationForm.controls['objet'].setValue(defaultsValues['objet_depense']);
  }
  /***
   * return the defaults values from the configuration
   */
  getDefaultValues(): Promise<ParametrageContenuDevis> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Get(TypeParametrage.parametrageDevis)
        .subscribe((response: Parametrage) => {
          resolve(response != null ? (JSON.parse(response.contenu) as ParametrageContenuDevis) : new ParametrageContenuDevis());
        }, error => reject(error));
    });
  }

  /**
   * get fournisseur with id
   */

  getFournisseursData(search, id?: any) {
    this.fournisseurService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.fournisseurs = res.list;
        this.creationForm.controls['idFournisseur'].setValue(id == null ? null : id.toString());
      });
  }
  getChantiersData(search, id?: any) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
        this.creationForm.controls['idChantier'].setValue(id == null ? null : id.toString());
      });
  }

  /**
  * build the creation Form
  */
  buildCreationForm(): void {
    //Current date
    var currentDate = new Date();
    //here 2 is day increament for the date and you can use -2 for decreament day
    currentDate.setDate(currentDate.getDate() + parseInt('1'));
    this.creationForm = this.formBuilder.group({
      reference: ["", [Validators.required]],
      idChantier: [null, [Validators.required]],
      idFournisseur: [null, [Validators.required]],
      dateCreation: [new Date()],
      dateExpiration: [currentDate],
      categorie: [null, [Validators.required]],
      objet: [],
      note: [],
      conditionRegelement: [],
    });
  }
  /**
   * initialize the creation Form
   */
  async initializeCreationForm() {
    this.creationForm.controls['dateCreation'].setValue(new Date());
  }

  /**
 * return a list of 'chantier'
 */
  getChantiers(search): Promise<void> {
    return new Promise((reslove, reject) => {
      this.chantierService
        .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
        .subscribe(async res => {
          this.chantiers = res.list;
          reslove();
        });
    });
  }

  /**
 * return a list of 'fournisseur'
 */
  getFournisseurs(search): Promise<void> {
    return new Promise((reslove, reject) => {
      this.fournisseurService
        .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
        .subscribe(async res => {
          this.fournisseurs = res.list;
          reslove();
        });
    });
  }

  /**
   * 
   *  Check form  valid
   */
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

  get f() { return this.creationForm.controls; }

  /**
   * Create body Request
   */
  createBodyRequest(status, articles): Depense {
    debugger
    const formValue = this.creationForm.value;
    const depense: Depense = new Depense();
    depense.reference = formValue.reference;
    //depense.dateCreation = new Date();
    depense.idChantier = formValue.idChantier;
    depense.idFournisseur = formValue.idFournisseur;
    depense.status = status;
    depense.memos = '[]';
    depense.dateCreation = AppSettings.formaterDatetime(formValue.dateCreation);
    depense.dateExpiration = AppSettings.formaterDatetime(formValue.dateExpiration);
    depense.prestations = articles.prestation;
    depense.total = articles.totalTtc;
    depense.totalHt = articles.totalHt;
    depense.tva = articles.tva;

    depense.categorie = formValue.categorie;
    depense.objet = formValue.objet;
    depense.note = formValue.note;
    depense.conditionsReglement = formValue.conditionRegelement;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    depense.historique = JSON.stringify([historique]);
    let idBCFournisseur = []

    idBCFournisseur.push(this.idsBonCommandeFournisseur)
    return depense;
  }

  /**
   * Ajouter Depense
   */
  async add(statut) {
    debugger
    const articles = await this.getDataFromArticlesComponet();
    const createBody = this.createBodyRequest(statut, articles);
    console.log("articles", articles.prestation);
    console.log(this.creationForm);
    if (this.checkFormIsValid() && articles.prestation != "[]") {

      this.depenseService.Add(createBody, this.idsBonCommandeFournisseur).subscribe(
        res => {
          this.translate.get('add').subscribe(text => {
            this.processing = true;
            toastr.success(text.msg, text.title, {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
            this.router.navigate(['/depense/detail', res.id]);
          });
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

  /***
 * compare two  date
 */
  compareDate(date1, date2) {
    //Note: 00 is month i.e. January  
    var dateOne = new Date(date1); //Year, Month, Date  
    var dateTwo = new Date(date2); //Year, Month, Date  
    if (dateOne >= dateTwo) {
      return true;
    } else {
      return false;
    }
  }

  getNameOfSelectedFournisseur(): string {
    try {
      return this.fournisseurs.filter(x => x.id == this.dataDepense.idFournisseur)[0].nom;
    } catch (error) {
      return "";
    }
  }
  getNameOfSelectedChantier(): string {
    try {
      return this.chantiers.filter(x => x.id == this.dataDepense.idChantier)[0].nom;
    } catch (error) {
      return "";
    }
  }
}
