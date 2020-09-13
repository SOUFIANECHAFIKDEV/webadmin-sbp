import { Component, OnInit } from '@angular/core';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FactureService } from 'app/services/facture/facture.service';
import { ClientService } from 'app/services/client/client.service';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';
import { ParametrageContenuDevis, Parametrage } from 'app/Models/Entities/Numerotation';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { Client } from 'app/Models/Entities/Client';
import { Adresse } from 'app/Models/Entities/Adresse';
import { Historique } from 'app/Models/Entities/Historique';
import { BonCommandeFournisseurService } from 'app/services/bonCommandeFournisseur/bonCommandeFournisseur.service';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { CreateBonCommandeFournisseur, BonCommandeFournisseurState } from '../bonCommandeFournisseurState';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';

declare var toastr: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  statutBonCommandeFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur;
  chantiers: Chantier[] = [];
  fournisseurs: Fournisseur[] = []
  actionHistorique: ActionHistorique = new ActionHistorique();
  prestations: any;
  // tva: any;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    //placeholder: 'Enter text here...',
    translate: 'yes',
  };

  dateLang: any;
  emitter: any = {};

  remise = 0
  typeRemise = '€'
  puc = 0
  prorata = 0
  retenueGarantie = 0
  processing: boolean = false;
  creationForm: any = null;
  idChantier: number = null;
  dataBonCommandeFournisseur
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
    private bonCommandeFournisseurService: BonCommandeFournisseurService,
    private fournisseurService: FournisseurService,
  ) { }

  async ngOnInit() {

    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    //get the list of 'chantier'
    await this.getChantiers('');
    //get list of 'fournisseur'
    await this.getFournisseurs('');
    this.buildCreationForm();
    //initialize the creation Form
    await this.initializeCreationForm();

    this.route.params.subscribe(async params => {
      if (params["id"] == CreateBonCommandeFournisseur.DUPLIQUER) {
    
    
        console.log("params", params)
        this.dataBonCommandeFournisseurDuplique(params);
      } else {
        await this.setDefaultValueBonCommande();
      }
    });

    this.processing = false;
    this.idChantier = await this.getIdChantier();
    if (this.idChantier != null) {
      this.getChantier()

    }

  }

  getIdChantier(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params["idChantier"]))
    });
  }
  chantierroute: any
  getChantier() {

    this.chantierService.Get(this.idChantier).subscribe(res => {
      this.chantierroute = res;
      this.creationForm.controls['idChantier'].setValue(this.chantierroute.nom);

    })
  }
  /**
 * Create Avoir  from dupliquer
 * @param params 
 */
  dataBonCommandeFournisseurDuplique(params) {

    this.dataBonCommandeFournisseur = BonCommandeFournisseurState.bonCommandeFournisseur;
    this.setData(params["id"], this.dataBonCommandeFournisseur)
    this.getChantiersData('', this.dataBonCommandeFournisseur.idChantier);
    // this.loadChantierInformation(this.dataBonCommandeFournisseur.idChantier);
    this.getFournisseursData('', this.dataBonCommandeFournisseur.idFournisseur);
  }
  /**
* build the creation Form
*/
  buildCreationForm(): void {
    this.creationForm = this.formBuilder.group({
      reference: ["", [Validators.required], this.CheckUniqueReference.bind(this)],


      idChantier: [null, [Validators.required]],
      idFournisseur: [null, [Validators.required]],
      dateCreation: [new Date(), [Validators.required]],
      dateExpiration: [null, [Validators.required]],
      objet: [],
      note: [],
      conditionRegelement: [],
      client: [null],
      adresseFacturation: [null]
    });
  }

  /**
 *  return the defaults values from the configuration
 */
  async setData(number, data) {


    if (number == CreateBonCommandeFournisseur.DUPLIQUER && data != null) {
      let bonCommandeFournisseur = data as BonCommandeFournisseur;
      this.prestations = JSON.parse(bonCommandeFournisseur.articles);
      this.creationForm.controls['objet'].setValue(bonCommandeFournisseur.objet);
      this.creationForm.controls['note'].setValue(bonCommandeFournisseur.note);
      this.creationForm.controls['conditionRegelement'].setValue(bonCommandeFournisseur.conditionsReglement);
      // this.remise = bonCommandeFournisseur.remise
      // this.typeRemise = bonCommandeFournisseur.typeRemise
      // this.puc = bonCommandeFournisseur.puc
      // this.prorata = bonCommandeFournisseur.prorata
      // this.retenueGarantie = bonCommandeFournisseur.retenueGarantie ? 1 : 0;

    }
  }
  get f() { return this.creationForm.controls; }
  /**
     * initialize the creation Form
     */
  async initializeCreationForm(): Promise<void> {
    //set the defaults values from the configuration
    let ref = await this.generateReference();
    this.creationForm.controls['reference'].setValue(await this.generateReference());
    this.creationForm.controls['dateCreation'].setValue(new Date);

    this.setdateExpiration();
  }
  /**
    * return default date Echeance 
    */
  async setdateExpiration() {
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultsValues();
    var dateToday = new Date();
    if (defaultsValues.validite_boncommande != null && defaultsValues.validite_boncommande != '') {
      dateToday.setDate(dateToday.getDate() + parseInt(defaultsValues.validite_boncommande.toString()));
    }
    this.creationForm.controls['dateExpiration'].setValue(dateToday)
  }

  /**
 * check if the reference is unique or not
 * @param control the input that we want to check its value
 */
  CheckUniqueReference(control: FormControl): Promise<any | null> {
    let promise = new Promise((resolve, reject) => {
      this.factureService.CheckUniqueReference(control.value)
        .subscribe(res =>
          res ? resolve({ CheckUniqueReference: true }) : resolve(null),
          error => reject(error)
        )
    });
    return promise;
  }
  /**
    * return a reference for the new insertion
    */
  generateReference(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.boncommande_fournisseur as number).subscribe(
        res => {
          reslove(res['data'] as string);

        },
        err => {
          (err);
        }
      );
    });
  }


  IncremenetRefernce(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Increment(TypeNumerotation.boncommande_fournisseur as number)
        .subscribe(res => resolve(res), err => reject(err))
    });
  }


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
    
        console.log("this.chantiers", res.list)
        this.chantiers = res.list;
        this.creationForm.controls['idChantier'].setValue(id == null ? null : id.toString());


        // await this.loadChantierInformation(id);
      });
  }
  getChantiers(search) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
      });
  }

  // loadChantierInformation(idChantier): Promise<void> {
  //   debugger

  //   return new Promise(async (reslove, reject) => {
  //     if (idChantier == null) {
  //       this.creationForm.controls["adresseFacturation"].setValue(null);
  //       this.creationForm.controls["client"].setValue(null);
  //     } else {
  //       const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
  //       const { idClient } = chantier;
  //       const client = await this.getclientById(idClient);
  //       this.creationForm.controls["client"].setValue(client);
  //       const defaultAdresse = JSON.parse(client.adresses) as Adresse[];
  //       const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
  //       if (!adresseIntervention) reslove();
  //       this.creationForm.controls["adresseFacturation"].setValue(adresseIntervention);

  //     }
  //     reslove();
  //   });
  // }



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


  /**
* return a list of 'chantier'
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
 * return the defaults values from the configuration
 */

  async setDefaultValueBonCommande() {

    this.creationForm.controls['reference'].setValue(await this.generateReference());
    //set the defaults values from the configuration
    const defaultsValues: ParametrageContenuDevis = await this.getDefaultsValues();
    this.creationForm.controls['note'].setValue(defaultsValues['note_boncommande']);
    this.creationForm.controls['conditionRegelement'].setValue(defaultsValues['conditions_boncommande']);
    this.creationForm.controls['objet'].setValue(defaultsValues['objet_boncommande']);
    if (defaultsValues.validite_boncommande) {
      var dateToday = new Date();
      dateToday.setDate(dateToday.getDate() + parseInt(defaultsValues.validite_boncommande.toString()));
      this.creationForm.controls['dateExpiration'].setValue(dateToday);

    }
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

  createBodyRequest(status): BonCommandeFournisseur {

    const formValue = this.creationForm.value;
    const bonCommandeFournisseur: BonCommandeFournisseur = new BonCommandeFournisseur();
    bonCommandeFournisseur.reference = formValue.reference;
    bonCommandeFournisseur.status = status;
    bonCommandeFournisseur.dateCreation = AppSettings.formaterDatetime(formValue.dateCreation);
    bonCommandeFournisseur.dateExpiration = AppSettings.formaterDatetime(formValue.dateExpiration);
    if (this.idChantier != null) {
      bonCommandeFournisseur.idChantier = this.idChantier;
    } else {
      bonCommandeFournisseur.idChantier = formValue.idChantier;
    }
    bonCommandeFournisseur.idFournisseur = formValue.idFournisseur;
    bonCommandeFournisseur.memos = '[]';
    bonCommandeFournisseur.dateCreation = formValue.dateCreation;
    bonCommandeFournisseur.objet = formValue.objet;
    bonCommandeFournisseur.note = formValue.note;
    bonCommandeFournisseur.conditionsReglement = formValue.conditionRegelement;
    bonCommandeFournisseur.articles = this.prestations.prestation;
    bonCommandeFournisseur.tva = this.prestations.tva;
    bonCommandeFournisseur.totalHt = this.prestations.totalHt;
    bonCommandeFournisseur.total = this.prestations.totalTtc;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    bonCommandeFournisseur.historique = JSON.stringify([historique]);

    return bonCommandeFournisseur;
  }

  async add(statut) {
    this.prestations = await this.getDataFromArticlesComponet();
    if (this.checkFormIsValid() && this.prestations.prestation != "[]") {
      const createBody = this.createBodyRequest(statut);
      this.bonCommandeFournisseurService.Add(createBody).subscribe(
        res => {
      
          if (res) {
            this.translate.get('addBonCommandeFournisseur').subscribe(text => {
              this.processing = true;
              this.IncremenetRefernce();
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.navigateToDetailBonCommande(res.id)
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

  navigateToDetailBonCommande(id) {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/commandes_devis/detail/${id}` : `/bonCommandeFournisseur/detail/${id}`;
    this.router.navigate([url]);
  }
  navigateToBonCommandeList() {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/commandes_devis/` : `/bonCommandeFournisseur`;
    this.router.navigate([url]);
  }

}
