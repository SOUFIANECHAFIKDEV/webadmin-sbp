import { Component, OnInit, DebugElement } from '@angular/core';
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
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { InterventionTechnicien } from 'app/Models/Entities/InterventionTechnicien';
declare var toastr: any;


@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {

  chantiers: Chantier[] = [];
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  form: any;
  techniciens: User[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  prestations: any;
  processing: boolean = false;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',

    //placeholder: 'Enter text here...',
    translate: 'yes',

  }
  dateLang: any;
  emitter: any = {};
  idIntervention: number;
  usersToDispaly: User[] = [];

  constructor(
    private translate: TranslateService,
    private chantierService: ChantierService,
    private paramteresService: ParameteresService,
    private formBuilder: FormBuilder,
    private ficheInterventionService: FicheInterventionService,
    private clientService: ClientService,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  async  ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.use(AppSettings.lang); this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.createForm();
    await this.getChantiers('');
    this.route.params.subscribe(async params => {
      this.idIntervention = params["id"];
      await this.initializeForm();
      this.processing = false;
    });

  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      reference: [null, [Validators.required], this.CheckUniqueIsReference.bind(this)],
      idChantier: [null, [Validators.required]],
      adresseIntervention: [null, [Validators.required]],
      dateDebut: [null, [Validators.required]],
      dateFin: [null, [Validators.required]],
      rapport: [null],
      objet: [null],
      client: [null],
      status: [null],
      nombreDeplacement: [null],
      nombrePanier: [null],
      historique: [null],
      memos: [null],
      emails: [null]

      // historique: [null],
    });
  }
  intervention: FicheIntervention
  ficheIntervention: FicheIntervention = new FicheIntervention();
  async initializeForm(): Promise<void> {

    try {
      const intervention = await this.getIntervention(this.idIntervention);
      this.intervention = intervention;
      this.ficheIntervention = intervention;
      this.form.controls["id"].setValue(intervention.id);
      this.form.controls["reference"].setValue(intervention.reference);
      this.form.controls["idChantier"].setValue(intervention.idChantier.toString());
      this.form.controls["adresseIntervention"].setValue(intervention.adresseIntervention);
      this.form.controls["dateDebut"].setValue(new Date(intervention.dateDebut));
      this.form.controls["dateFin"].setValue(new Date(intervention.dateFin));
      this.form.controls["rapport"].setValue(intervention.rapport);
      this.form.controls["objet"].setValue(intervention.objet);
      this.form.controls["emails"].setValue(intervention.emails);
      this.form.controls["memos"].setValue(intervention.memos);
      this.form.controls["status"].setValue(intervention.status);
      this.form.controls["nombreDeplacement"].setValue(intervention.nombreDeplacement);
      this.form.controls["nombrePanier"].setValue(intervention.nombrePanier);
      this.form.controls["historique"].setValue(intervention.historique);

      this.prestations = JSON.parse(JSON.parse(intervention.prestations).prestation);
      intervention.idAgendaGoogle;
      this.techniciens = intervention.interventionTechnicien.map(technicien => {
        return technicien.idTechnicienNavigation
      });

      this.usersToDispaly = intervention.interventionTechnicien.map(technicien => {
        return technicien.idTechnicienNavigation
      });

      await this.loadChantierInformation(intervention.idChantier);
    } catch (err) {
      (err);
    }
  }

  getChantiers(search): Promise<void> {
    return new Promise((reslove, reject) => {
      this.chantierService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe(async (res) => {
        this.chantiers = res.list;
        reslove();
      });
    });
  }

  generateReference(): Promise<string> {
    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.fiche_intervention as number)
        .subscribe(res => { reslove(res['data'] as string); }, err => { (err); });
    })
  }

  CheckUniqueIsReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.ficheInterventionService.CheckUniqueReference(control.value).subscribe(res => {
        if (res == true && control.value != this.intervention.reference) { resolve({ CheckUniqueReference: true }); }
        else { resolve(null); }
      });
    });
    return promise;
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

  getclientById(idClient): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  setTechnicien(techniciens: User[]): void {
    this.techniciens = techniciens;
  }

  setPrestations() {
    return [];
  }

  /**
   *   getIntervention(id): Promise<FicheIntervention> {
    return new Promise((resolve, reject) => {
      this.ficheInterventionService.Get(id).subscribe(res => {
        resolve(res);
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    });
  }
   */
  getDataFromArticlesComponet(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave((res) => {
        resolve(res);
      }, err => {
        this.translate.get("errors").subscribe(err => {
          toastr.warning('text.serveur', "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      });
    });
  }

  createBodyRequest(): FicheIntervention {
    debugger
    const formValue = this.form.value;
    let ficheIntervention: FicheIntervention = new FicheIntervention();
    ficheIntervention.id = formValue.id;
    ficheIntervention.reference = formValue.reference;
    ficheIntervention.idChantier = formValue.idChantier;
    ficheIntervention.status = formValue.status;
    ficheIntervention.adresseIntervention = JSON.stringify(formValue.adresseIntervention);
    ficheIntervention.emails = formValue.emails;
    ficheIntervention.memos = formValue.memos;
    ficheIntervention.dateDebut = AppSettings.formaterDatetime(formValue.dateDebut);
    ficheIntervention.dateFin = AppSettings.formaterDatetime(formValue.dateFin);
    ficheIntervention.signatureClient = null;
    ficheIntervention.signatureTechnicien = null;
    ficheIntervention.prestations = JSON.stringify(this.prestations);
    ficheIntervention.nombreDeplacement = formValue.nombreDeplacement;
    ficheIntervention.objet = formValue.objet;
    ficheIntervention.nombrePanier = formValue.nombrePanier;
    ficheIntervention.rapport = formValue.rapport;
    ficheIntervention.idAgendaGoogle = this.ficheIntervention.idAgendaGoogle;

    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    ficheIntervention.historique = formValue.historique;

    ficheIntervention.interventionTechnicien = this.techniciens.map(technicien => {
      const interventionTechnicien = this.ficheIntervention.interventionTechnicien.filter(I => I.idTechnicien == technicien.id);
      if (interventionTechnicien.length == 0) {
        return ({ idTechnicien: technicien.id }) as InterventionTechnicien;
      } else {

        return (interventionTechnicien[0]) as InterventionTechnicien;
      }
    });
    return ficheIntervention;
  }

  async  update() {
    debugger
    const compareDate = this.compareDate(this.form.value.dateFin, this.form.value.dateDebut)
    if (!compareDate) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.datesIntervention, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return;
    }
    debugger

    // const {prestation} = await this.getDataFromArticlesComponet();
    if (this.form.valid && this.techniciens.length > 0) {
      this.prestations = await this.getDataFromArticlesComponet();
      console.log(this.prestations)
      if (this.prestations.prestation != "[]") {
        const createBody = this.createBodyRequest();
        (createBody)
        this.ficheInterventionService.Update(createBody.id, createBody).subscribe(res => {
          if (res) {
            this.processing = true;
            this.translate.get("update").subscribe(text => {
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


    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  IncremenetRefernce() {
    this.paramteresService.Increment(this.typeNumerotation.fiche_intervention as number)
      .subscribe(res => { })
  }

  get f() { return this.form.controls; }


  getTechniciens(techniciens: User[]): void {

    this.techniciens = techniciens;
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

  getIntervention(id): Promise<FicheIntervention> {
    return new Promise((resolve, reject) => {
      this.ficheInterventionService.Get(id).subscribe(res => {
        resolve(res);
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    });
  }

}
