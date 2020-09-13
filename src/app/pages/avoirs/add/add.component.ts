import { Component, OnInit, ViewChild } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
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
import { AvoirService } from 'app/services/avoir/avoir.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { CreateAvoir } from 'app/Enums/CreateAvoir.Enum';
import { AvoirState } from '../avoir-state';
import { Avoir, infoClientModel } from 'app/Models/Entities/Avoir';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { Client } from 'app/Models/Entities/Client';
import { Historique } from 'app/Models/Entities/Historique';
import { Adresse } from 'app/Models/Entities/Adresse';
declare var toastr: any;
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  chantiers: Chantier[] = [];
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  statutAvoir: typeof StatutAvoir = StatutAvoir;
  form: any;
  actionHistorique: ActionHistorique = new ActionHistorique();
  prestations: any;
  tva: any;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    //placeholder: 'Enter text here...',
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
  delaiGarantie = 0;
  idFichesTravail
  loading
  dataAvoir
  listClients: Client[] = [];
  processing: boolean = false;
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
    private avoirService: AvoirService,
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    this.form = this.formBuilder.group({
      reference: [null, [Validators.required], this.CheckUniqueIsReference.bind(this)],
      idChantier: [null],
      dateCreation: [new Date(), [Validators.required]],
      dateEcheance: [null, [Validators.required]],
      object: [],
      note: [],
      conditionRegelement: [],
      client: [null, [Validators.required]],
      adresseFacturation: [null]

    });
    await this.initializeForm();
    //await this.getChantiers('');
    //await this.setDefaultValueAvoir();
    this.route.params.subscribe(async params => {

      if (params["id"] == CreateAvoir.DUPLIQUER) {
        this.dataAvoir = AvoirState.avoir;
        this.dataAvoirDuplique(params, this.dataAvoir)
      } else {

        await this.setDefaultValueAvoir();

      }
    });
    this.processing = false;
  }
  setdateEcheance() {
    var dateToday = new Date();
    this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(value => {
      const dataParametrage = JSON.parse(value.contenu);

      if (dataParametrage != null) {

        if (dataParametrage.validite_avoir) {

          dateToday.setDate(dateToday.getDate() + parseInt(dataParametrage.validite_avoir.toString()));
          this.form.controls['dateEcheance'].setValue(dateToday);
        }
      }
    });
  }

  /**
  * Create Avoir  from dupliquer
  * @param params 
  */

  dataAvoirDuplique(params, data) {
    data = AvoirState.avoir;
    this.setData(params["id"], data)
    this.getChantiersData('', data.idChantier);
    if (data.idChantier == null) {
      this.getClientsData('', data.idClient);


    }
    this.loadChantierInformation(data.idChantier);
  }
  setData(number, data) {
    if (number == CreateAvoir.DUPLIQUER && data != null) {
      let avoir = data as Avoir;
      this.setdateEcheance();
      this.prestations = JSON.parse(avoir.prestations);
      this.form.controls['object'].setValue(avoir.object);
      this.form.controls['note'].setValue(avoir.note);
      this.form.controls['conditionRegelement'].setValue(avoir.conditionRegelement);
      this.form.controls['dateCreation'].setValue(new Date(avoir.dateCreation));
      this.remise = avoir.remise
      this.typeRemise = avoir.typeRemise
      this.puc = avoir.puc
      this.prorata = avoir.prorata
      this.retenueGarantie = avoir.retenueGarantie;
      this.delaiGarantie = avoir.delaiGarantie;
    }

  }

  async initializeForm(): Promise<void> {
    this.form.controls['reference'].setValue(await this.generateReference());
  }
  getChantiersData(search, id?: any) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
        this.form.controls['idChantier'].setValue(id == null ? null : id.toString());
        // await this.loadChantierClient(id);
      });
  }
  // Pour récupérer la liste des clients
  getClientsData(search, id?: any) {

    this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc")
      .subscribe((res) => {

        this.listClients = res.list;
        const client = res.list.filter(x => x.id == id)[0];
        this.form.controls['client'].setValue(client.nom);
        this.loadClientAdresse(client)
      });
  }
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
  getClients() {
    this.clientService.GetAll("", 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe((res) => {
      this.listClients = res.list;
    });

  }

  generateReference(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.avoir as number).subscribe(
        res => {
          reslove(res['data'] as string);
        },
        err => {
          (err);
        }
      );
    });
  }

  setDefaultValueAvoir() {
    this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(value => {
      this.setdateEcheance();
      const data = JSON.parse(value.contenu);
      (data);
      if (data != null) {
        this.form.controls['note'].setValue(data['note_avoir']);
        this.form.controls['conditionRegelement'].setValue(data['conditions_avoir']);
        this.form.controls['object'].setValue(data['objet_avoir']);
      }
    });
  }

  CheckUniqueIsReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.factureService.CheckUniqueReference(control.value).subscribe(res => {
        if (res == true) {
          resolve({ CheckUniqueReference: true });
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }

  loadChantierInformation(idChantier): Promise<void> {

    return new Promise(async (reslove, reject) => {
      if (idChantier == null) {
        this.form.controls["adresseFacturation"].setValue(null);
        this.form.controls["client"].setValue(null);
      } else {
        const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
        const { idClient } = chantier;
        const client = await this.getclientById(idClient);
        console.log(this.form.controls["client"])
        try {
          this.form.controls["client"].setValue('client');
          this.form.controls["client"].setValue(client);
        } catch (ex) {
          console.log(ex);
        }
        const defaultAdresse = JSON.parse(client.adresses) as Adresse[];
        const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
        if (!adresseIntervention) reslove();
        this.form.controls["adresseFacturation"].setValue(adresseIntervention);

      }
      reslove();
    });
  }
  clientSelected: Client;
  loadClientAdresse(Client): Promise<void> {

    return new Promise((resolve, reject) => {
      this.clientSelected = this.listClients.filter(c => c.id == Client.id)[0];
      // const {}
      const defaultAdresse = JSON.parse(this.clientSelected.adresses) as Adresse[];
      const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
      if (!adresseFacturation) resolve();
      this.form.controls["adresseFacturation"].setValue(adresseFacturation);

    })

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

  createBodyRequest(status): Avoir {

    //const dataArticles = this.getDataFromArticlesComponet();
    const formValue = this.form.value;
    const avoir: Avoir = new Avoir();
    avoir.reference = formValue.reference;
    avoir.dateCreation = AppSettings.formaterDatetime(formValue.dateCreation);
    avoir.dateEcheance = AppSettings.formaterDatetime(formValue.dateEcheance);
    avoir.idChantier = formValue.idChantier;
    //region : ajout des informations du client
    const client: Client = formValue.client
    avoir.idClient = client.id;

    if (formValue.idChantier == null && avoir.idClient == undefined) {
      avoir.idClient = this.dataAvoir.idClient;
      avoir.infoClient = this.dataAvoir.infoClient;
    } else {
      let infoClient: infoClientModel = new infoClientModel();
      infoClient.codeClient = client.codeclient;
      infoClient.nom = client.nom;
      infoClient.adresseFacturation = formValue.adresseFacturation;
      avoir.infoClient = JSON.stringify(infoClient);
    }


    //end region
    avoir.status = status;
    avoir.memos = '[]';
    avoir.dateCreation = formValue.dateCreation;
    avoir.object = formValue.object;
    avoir.note = formValue.note;
    avoir.conditionRegelement = formValue.conditionRegelement;
    avoir.prestations = this.prestations.prestation;
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
  checkValiddelaiGarantie(retenueGarantie, delaiGarantie) {
    if (retenueGarantie != null && (delaiGarantie == null || delaiGarantie == "null"))
    //  if (retenueGarantie != 1 && retenueGarantie != null && delaiGarantie == null)
    {
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

    if (!this.form.valid) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.fillAll, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return;
    }


    const compareDate =
      this.form.value.dateEcheance == null || this.form.value.dateEcheance == null
        ? true
        : this.compareDate(this.form.value.dateEcheance, this.form.value.dateCreation);
    if (!compareDate) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.datesIntervention, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return;
    }

    this.prestations = await this.getDataFromArticlesComponet();
    console.log("prest avoir", this.prestations)
    if (!this.checkValiddelaiGarantie(this.prestations.retenueGarantie, this.prestations.delaiGarantie)) {
      return
    }
    if (this.checkFormIsValid() && this.prestations.prestation != "[]") {
      const createBody = this.createBodyRequest(statut);
      this.avoirService.Add(createBody).subscribe(
        res => {
          if (res) {
            this.translate.get('add').subscribe(text => {
              this.processing = true;
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
  checkFormIsValid(): boolean {

    let valid = true;
    for (let key in this.form.controls) {
      if (this.form.controls[key].errors != null) {
        valid = false;
      }
    }
    return valid;
  }


  IncremenetRefernce() {
    ;
    this.paramteresService.Increment(this.typeNumerotation.avoir as number).subscribe(res => { });
  }

  get f() {
    return this.form.controls;
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

}
