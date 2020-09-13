import { Component, OnInit } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from "@ngx-translate/core";
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { Client } from 'app/Models/Entities/Client';
import { ClientService } from 'app/services/client/client.service';
import { Adresse } from 'app/Models/Entities/Adresse';
import { User } from 'app/Models/Entities/User';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { Historique } from 'app/Models/Entities/Historique';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { SignatueFicheIntervention } from 'app/Models/signatueFicheIntervention';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { InterventionTechnicien } from 'app/Models/Entities/InterventionTechnicien';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { UserProfile } from 'app/Enums/user-profile.enum';
declare var toastr: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  chantiers: Chantier[] = [];
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  //  statutFacture: typeof StatutFacture = StatutFacture
  statutFicheintervention: typeof StatutFicheIntervention = StatutFicheIntervention
  form: any;
  techniciens: User[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  userProfile: typeof UserProfile = UserProfile;

  prestations: any;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    //placeholder: 'Enter text here...',
    translate: 'yes',

  }
  chantierPreDefini = null;
  dateLang: any;
  emitter: any = {};
  processing: boolean = false;
  constructor(
    private translate: TranslateService,
    private chantierService: ChantierService,
    private paramteresService: ParameteresService,
    private formBuilder: FormBuilder,
    private ficheInterventionService: FicheInterventionService,
    private clientService: ClientService,
    private loginService: LoginService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.use(AppSettings.lang); this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.createForm();
    await this.initializeForm();
    await this.getChantiers('');
    this.processing = false;


  }

  createForm(): void {
    this.form = this.formBuilder.group({
      reference: [null, [Validators.required], this.CheckUniqueIsReference.bind(this)],
      idChantier: [null, [Validators.required]],
      adresseIntervention: [null, [Validators.required]],
      dateDebut: [null, [Validators.required]],
      dateFin: [null, [Validators.required]],
      rapport: [null],
      client: [null],
      objet: [null],
    });
  }

  async initializeForm(): Promise<void> {
    this.form.controls["reference"].setValue(await this.generateReference());
    this.form.controls["objet"].setValue(await this.getObjetFromParametrage());
  }

  getObjetFromParametrage(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {
        const data = JSON.parse(res.contenu);
        reslove(data['objet_interventions']);
      });
    });
  }


  /************
   * Réference
   */
  generateReference(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.fiche_intervention as number)
        .subscribe(res => { reslove(res['data'] as string); }, err => { (err); });
    });
  }

  CheckUniqueIsReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.ficheInterventionService.CheckUniqueReference(control.value).subscribe(res => {
        if (res == true) { resolve({ CheckUniqueReference: true }); }
        else { resolve(null); }
      });
    });
    return promise;
  }

  IncremenetRefernce() {
    this.paramteresService.Increment(this.typeNumerotation.fiche_intervention as number)
      .subscribe(res => { })
  }
  /*********
   *function  Chantier 
   */
  getChantiers(search): Promise<void> {
    return new Promise((reslove, reject) => {
      this.chantierService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe(async (res) => {
        this.chantiers = res.list;
        reslove();
      });
    });
  }

  loadChantierInformation(idChantier): Promise<void> {
    return new Promise(async (reslove, reject) => {
      if (idChantier == null) {
        this.form.controls["adresseIntervention"].setValue(null);
        this.form.controls["client"].setValue(null);
      } else {
        const chantier: Chantier = this.chantiers.filter(c => c.id == idChantier)[0];
        const { idClient } = chantier;
        const client = await this.getclientById(idClient);
        this.form.controls["client"].setValue(client);
        const defaultAdresse = JSON.parse(client.adresses) as Adresse[];
        const adresseIntervention = defaultAdresse.filter(A => A.default == true)[0];
        if (!adresseIntervention) reslove();
        this.form.controls["adresseIntervention"].setValue(adresseIntervention);
      }
      reslove();
    });
  }
  /********************
   * Client
   */
  getclientById(idClient): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }



  get f() { return this.form.controls; }
  createBodyRequest(status): FicheIntervention {
    const formValue = this.form.value;
    let ficheIntervention: FicheIntervention = new FicheIntervention();
    ficheIntervention.reference = formValue.reference;
    ficheIntervention.dateCreation = new Date();
    ficheIntervention.idChantier = formValue.idChantier;
    ficheIntervention.status = status;
    ficheIntervention.adresseIntervention = JSON.stringify(formValue.adresseIntervention);
    ficheIntervention.emails = '[]';
    ficheIntervention.memos = '[]';
    ficheIntervention.dateDebut = AppSettings.formaterDatetime(formValue.dateDebut);
    ficheIntervention.dateFin = AppSettings.formaterDatetime(formValue.dateFin);
    ficheIntervention.signatureClient = null;
    ficheIntervention.signatureTechnicien = null;
    ficheIntervention.prestations = JSON.stringify(this.prestations);
    ficheIntervention.nombreDeplacement = 0;
    ficheIntervention.nombrePanier = 0;
    ficheIntervention.rapport = formValue.rapport;
    ficheIntervention.objet = formValue.objet;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    ficheIntervention.historique = JSON.stringify([historique]);

    ficheIntervention.interventionTechnicien = this.techniciens.map(technicien => {
      return ({ idTechnicien: technicien.id }) as InterventionTechnicien;
    });

    return ficheIntervention;
  }

  async  add(statut) {

    const compareDate = this.form.value.dateFin == null || this.form.value.dateFin == null ? true : this.compareDate(this.form.value.dateFin, this.form.value.dateDebut)
    if (!compareDate) {

      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.datesIntervention, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return;
    }
    this.prestations = await this.getDataFromArticlesComponet();
    if (this.form.valid && this.prestations.prestation != "[]" && this.techniciens.length > 0) {
      const createBody = this.createBodyRequest(statut);
      this.ficheInterventionService.Add(createBody).subscribe(res => {
        if (res) {
          this.processing = true;
          this.translate.get("add").subscribe(text => {
            this.IncremenetRefernce()
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/ficheintervention/detail", res.id]);
          });
        }
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, () => {
        this.processing = false;
      });

    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  /***************
   * Prestation
   */

  setPrestations() {
    return [];
  }

  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave((res) => {
        resolve(res);
      })
    })
  }

  /*************
   * Technicien
   */
  setTechnicien(techniciens: User[]): void {
    this.techniciens = techniciens;
  }

  getTechniciens(techniciens: User[]): void {
    this.techniciens = techniciens;
  }


  /***
   * compare two  date
   */

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
