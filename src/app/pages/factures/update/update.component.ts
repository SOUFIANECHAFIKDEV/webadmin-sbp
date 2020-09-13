import { Component, OnInit, ViewChild } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Client } from 'app/Models/Entities/Client';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from 'app/services/client/client.service';
import { FactureService } from 'app/services/facture/facture.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Facture } from 'app/Models/Entities/Facture';
import { Prestation } from 'app/Models/Entities/Prestation';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { TableArticleComponent } from 'app/common/table-article/table-article.component';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Chantier } from 'app/Models/Entities/Chantier';
import { LoginService } from 'app/services/login/login.service';
import { Historique } from 'app/Models/Entities/Historique';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { Adresse } from 'app/Models/Entities/Adresse';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { infoClientModel } from 'app/Models/Entities/Avoir';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';

declare var toastr: any;


@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})

export class UpdateComponent implements OnInit {
  @ViewChild(TableArticleComponent)
  tableArticleComponent: TableArticleComponent;
  form: FormGroup;
  clients: Client[] = [];
  typeClient: number;
  statutFacture: typeof StatutFacture = StatutFacture;
  typeFacture: typeof TypeFacture = TypeFacture;
  actionHistorique: ActionHistorique = new ActionHistorique();
  loading = false;
  facture: Facture;
  id: number;
  articles: Prestation[] = [];
  reference: FactureReferenceModel;
  chantiers: Chantier[] = [];
  dateLang: any;
  prestations: any;
  articlesInfo: any = {};
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  emitter: any = {};
  client: Client = new Client();
  adresseFacturation: Adresse = new Adresse();
  adresses: Adresse[] = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    translate: 'yes',
  }
  idChantier: number = null;
  processing: boolean = false;
  constructor(
    private translate: TranslateService,
    private clientService: ClientService,
    private factureService: FactureService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private chantierService: ChantierService,
    private loginService: LoginService,
    private paramteresService: ParameteresService
  ) {
    this.form = this.fb.group({
      reference: [null, [Validators.required]],
      dateCreation: [null, [Validators.required]],
      dateEcheance: [null, [Validators.required]],
      idChantier: [null],
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
      client: [null, [Validators.required]],
      adresseFacturation: [null, [Validators.required]],
    });
  }

  CheckUniqueReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.factureService.CheckUniqueReference(control.value).subscribe(res => {
        if (res === true && control.value != this.form.value.reference) {
          resolve({ CheckUniqueReference: true });
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }
  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    debugger
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.factureService.Get(this.id).subscribe(res => {
        debugger
        this.facture = res;
        if (this.facture.idChantier != null) {
          //this.getChantiers('', this.facture.idChantier);
          this.LoadchantietClient(this.facture)
        } else {
          this.getClients('', this.facture.idClient);
          let infoClient: infoClientModel = new infoClientModel();
          infoClient = JSON.parse(this.facture.infoClient);
          let adresse = infoClient.adresseFacturation as Adresse;
          this.form.controls['adresseFacturation'].setValue(adresse);
          this.getChantiers('');
        }
        this.setData();
      });
      // this.processing = false;



    });
    this.route.params.subscribe(params => {
      this.idChantier = params['idChantier'];
    });

  }


  GetNameOfChantier(idChantier) {

    const result = (this.chantiers as any[]).filter(c => c.id == idChantier);
    return result.length > 0 ? result[0].nom : '';
  }

  LoadchantietClient(facture) {
    debugger
    this.getChantiers('', facture.idChantier);
    // this.form.controls['idChantier'].setValue(facture.idChantier == null ? null : facture.idChantier.toString());
    //const chantier = this.chantiers.filter(c => c.id == id)[0];
    this.client = facture.chantier.client;
    // this.client = await this.getclientById(idClient);
    this.form.controls['client'].setValue(this.client.nom);
    const adresses: Adresse[] = JSON.parse(this.client.adresses) as Adresse[];
    this.adresses = adresses == null ? [] : adresses;
    const defaultAdresse = JSON.parse(this.client.adresses) as Adresse[];
    const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
    this.form.controls['adresseFacturation'].setValue(adresseFacturation);
    return this.client;

  }
  getChantiers(search, id?: any) {
    debugger
    this.chantierService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.processing = true;
        this.chantiers = res.list;
        this.form.controls['idChantier'].setValue(id == null ? null : id.toString());
        await this.loadChantierClient(id);
        this.processing = false;
      });
  }

  // Pour récupérer la liste des clients
  getClients(search, id?: any) {
    this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc")
      .subscribe((res) => {
        this.clients = res.list;
        const client = res.list.filter(x => x.id == id)[0];
        if (client == undefined) return;
        this.form.controls['client'].setValue(client.nom);
        this.processing = false;
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
  async loadChantierClient(idChantier) {
    debugger
    const chantier = this.chantiers.filter(c => c.id == idChantier)[0];
    let idClient = chantier == undefined ? null : chantier.idClient;
    if (idClient == null) {
      this.client = null;
      this.adresses = [];
      this.adresseFacturation = null;
      return;
    }
    this.client = chantier.client;
    // this.client = await this.getclientById(idClient);
    const adresses: Adresse[] = JSON.parse(this.client.adresses) as Adresse[];
    this.adresses = adresses == null ? [] : adresses;
    const defaultAdresse = JSON.parse(this.client.adresses) as Adresse[];
    const adresseFacturation = defaultAdresse.filter(a => a.default == true)[0];
    this.form.controls['adresseFacturation'].setValue(adresseFacturation);
    return this.client;


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
    debugger
    this.form.controls['reference'].setValue(this.facture.reference);
    this.form.controls["dateCreation"].setValue(new Date(this.facture.dateCreation));
    this.form.controls["dateEcheance"].setValue(new Date(this.facture.dateEcheance));
    this.form.controls['object'].setValue(this.facture.object);
    this.form.controls['note'].setValue(this.facture.note);
    this.form.controls['conditionRegelement'].setValue(this.facture.conditionRegelement);
    this.form.controls['prorata'].setValue(this.facture.prorata);
    this.form.controls['puc'].setValue(this.facture.puc);
    this.form.controls['status'].setValue(this.facture.status.toString());
    this.form.controls['remise'].setValue(this.facture.remise);
    this.form.controls['typeRemise'].setValue(this.facture.typeRemise);
    this.form.controls['retenueGarantie'].setValue(this.facture.retenueGarantie);
    this.form.controls['delaiGarantie'].setValue(this.facture.delaiGarantie);
    this.form.controls['tvaGlobal'].setValue(this.facture.tvaGlobal);
    this.articles = JSON.parse(this.facture.prestations);
  }

  // Get information de form
  get f() {
    return this.form.controls;
  }

  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave(res => {
        resolve(res);
      });
    });
  }

  clientfacture: any
  createBodyRequest(status, prestations, formValue): Facture {

    const facture: Facture = new Facture();
    console.log("cc", this.client)

    //region : ajout des informations du client
    let infoClient: infoClientModel = new infoClientModel();
    if (formValue.idChantier != null) {
      this.clientfacture = this.client;
    } else {
      this.clientfacture = formValue.client
    }

    if (formValue.idChantier == null && infoClient.codeClient == undefined && infoClient.adresseFacturation == undefined) {
      facture.idClient = this.facture.idClient;
      facture.infoClient = this.facture.infoClient;
    } else {
      facture.idClient = this.clientfacture.id;
      infoClient.codeClient = this.clientfacture.codeclient;
      infoClient.nom = this.clientfacture.nom;
      infoClient.adresseFacturation = formValue.adresseFacturation;
      facture.infoClient = JSON.stringify(infoClient);
    }


    //end region ajout des informations du client


    facture.typeFacture = this.facture.typeFacture;
    facture.reference = formValue.reference;
    facture.idChantier = formValue.idChantier;
    facture.chantier = this.facture.chantier;
    facture.status = status;
    facture.emails = '[]';
    facture.memos = '[]';
    facture.idDevis = this.facture.idDevis;
    facture.devis = this.facture.devis;
    let dateCreation: any = AppSettings.formaterDatetime(formValue.dateCreation);
    facture.dateCreation = dateCreation;
    let dateEcheance: any = AppSettings.formaterDatetime(formValue.dateEcheance);
    facture.dateEcheance = dateEcheance
    facture.object = formValue.object;
    facture.note = formValue.note;
    facture.conditionRegelement = formValue.conditionRegelement;
    // -------------------

    //start region :prestations
    facture.prestations = this.prestations.prestation;
    facture.tva = prestations.tva;
    facture.remise = prestations.remise;
    facture.typeRemise = prestations.typeRemise;
    facture.prorata = prestations.prorata;
    facture.puc = prestations.puc;
    facture.totalHt = prestations.totalHt;
    facture.total = prestations.totalTtc;
    facture.tvaGlobal = prestations.tvaGlobal;
    facture.retenueGarantie = prestations.retenueGarantie;
    facture.delaiGarantie = prestations.delaiGarantie;
    facture.statusGarantie = StatutRetenueGarantie.nonrecuperer;
    //end region prestations

    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    facture.historique = JSON.stringify([historique]);



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
  async update(status) {

    const compareDate = this.compareDate(
      this.form.value.dateEcheance,
      this.form.value.dateCreation
    );
    if (!compareDate) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.datesIntervention, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return;
    }
    debugger
    this.prestations = await this.getDataFromArticlesComponet();
    if (!this.checkValiddelaiGarantie(this.prestations.retenueGarantie, this.prestations.delaiGarantie)) {
      return
    }
    if (this.form.valid && this.prestations.prestation != '[]') {
      const formValue = this.form.value;
      const createBody = this.createBodyRequest(status, this.prestations, formValue);

      this.factureService.Update(this.id, createBody).subscribe(
        res => {
          if (res) {
            this.processing = true;
            this.translate.get('updateFacture').subscribe(text => {
              //  this.IncremenetRefernce();
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.navigateToDetailComponenet();
              // this.router.navigate(['/factures/detail', res.id]);
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


  navigateToDetailComponenet() {

    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation/detail/${this.facture['id']}` : `/factures/detail/${this.facture['id']}`;
    this.router.navigate([url]);
  }


  navigateToFactureList() {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/facturation` : `/factures`
    this.router.navigate([url]);
  }

}
