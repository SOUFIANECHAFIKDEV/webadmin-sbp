import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormControl, AbstractControl } from "@angular/forms";
import { DepartementService } from "app/services/departement/departement.service";
import { VilleService } from "app/services/ville/ville.service";
import { PaysService } from "app/services/pays/pays.service";
import { Departement } from "app/Models/Entities/Depatement";
import { Ville } from "app/Models/Entities/Ville";
import { Pays } from "app/Models/Entities/Pays";
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { Router } from "@angular/router";
import { Contact } from "app/Models/Entities/Contact";
import { Historique } from "app/Models/Entities/Historique";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum"
import { UtilisateurService } from "app/services/users/user.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { LoginService } from "app/services/login/login.service";
import { TypeNumerotation } from "app/Enums/TypeNumerotation.Enum";
import { PlanComptableModel } from "app/Models/PlanComptableModel";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
import { PlanComptableEnum } from "app/Enums/PlanComptable.Enum";
declare var toastr: any;

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"]
})
export class AddComponent implements OnInit {

  form;
  departements: Departement[];
  villes: Ville[];
  pays: Pays[];
  contacts: Contact[] = [];

  actionHistorique: ActionHistorique = new ActionHistorique();
  afficherList = false; /* Afficher la liste des département et des villes si il a dans la bdd */
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  CodeComptable
  constructor(
    private fb: FormBuilder,
    private departementService: DepartementService,
    private villeService: VilleService,
    private paysService: PaysService,
    private fournisseurService: FournisseurService,
    private router: Router,
    private translate: TranslateService,
    private utilisateurService: UtilisateurService,
    private paramteresService: ParameteresService,
    private loginService: LoginService
  ) {

    this.generateReference()
  }

  CreateForm() {
    this.form = this.fb.group({
      reference: ["", [Validators.required], this.CheckUniqueReference.bind(this)],
      nom: ["", [Validators.minLength(5), Validators.required]],
      idPays: [AppSettings.SHOW_CITY_OF_COUNTRY[0], Validators.required],
      adresse: ["", Validators.required],
      complementAdresse: [""],
      ville: ["", [Validators.required]],
      codePostal: ["", this.phoneNumberValidator.bind(this)],
      departement: [""],
      telephone: [null, [Validators.minLength(10), Validators.pattern(AppSettings.regexPhone)]],
      fax: ["", [Validators.pattern(AppSettings.regexPhone)]],
      email: [null, [Validators.pattern(AppSettings.regexEmail)]],
      siteWeb: [null, [Validators.pattern(AppSettings.regexURL)]],
      siret: [""],
      tvaIntraCommunautaire: [""],
      codeComptable: [""]
    });
  }

  /** --------------------------------------------------
     @description initialiser le formulaire de création
     -------------------------------------------------- */
  async initializeCreationForm() {
    await this.generateReference()
    this.form.controls['codeComptable'].setValue(this.CodeComptable);
  }

  async ngOnInit() {
    await this.CreateForm();
    this.CodeComptable = await this.GetCodeComptable();
    await this.initializeCreationForm()
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetPays("");
    this.SearchVille("");
    this.GetDepartements(AppSettings.SHOW_CITY_OF_COUNTRY[0]);


  }

  phoneNumberValidator(control: FormControl): { [key: string]: any } | null {

    const valid = /^\d+$/.test(control.value)
    return (control.value.length == 0 || valid) ? null : { invalidNumber: { valid: false, value: control.value } }
  }

  GetDepartements(search) {

    this.afficherList = AppSettings.SHOW_CITY_OF_COUNTRY.filter(idPays => idPays == search).length > 0 ? true : false;
    this.villes = [];
    this.departements = [];
    this.departementService
      .GetAll(search, 1, AppSettings.MAX_GET_DATA, "DepartementNom", "ASC")
      .subscribe(value => {
        this.departements = value.list;
      });
  }

  GetVilles(search) {
    try {
      let departement = this.departements.filter(x => x.departementNom == search)[0];
      this.villeService
        .GetAll(departement.id, 1, AppSettings.MAX_GET_DATA, "VilleNom", "ASC")
        .subscribe(value => {
          this.villes = value.list;
        });
    } catch (ex) { }
  }

  GetPays(search) {
    this.paysService
      .GetAll(search, 1, AppSettings.MAX_GET_DATA, "NomFrFr", "ASC")
      .subscribe(value => {
        this.pays = value.list;
      });
  }


  add() {
    if (this.form.valid) {
      this.translate.get("add").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["contacts"] = JSON.stringify(this.contacts);
        let historique = new Historique();
        historique.IdUser = this.loginService.getUser().id;
        historique.action = this.actionHistorique.Added;
        values["historique"] = JSON.stringify([historique]);
        values["memos"] = JSON.stringify([]);
        this.fournisseurService.Add(values).subscribe(res => {
          if (res) {
            this.IncremenetRefernce()
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/fournisseurs/detail", res.id]);
          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {

        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  GetDepartementOfVille(ville) {
    let departements = this.departements.filter(x => x.id == parseInt(ville.idDepartement))
    if (departements.length > 0) {
      this.form.controls["departement"].setValue(departements[0].departementNom)
    }
  }

  changeCodePostal(nom) {
    let villes = this.villes.filter(x => x.villeNomReel == nom);
    if (villes.length > 0) {
      this.GetDepartementOfVille(villes[0])
      this.form.controls["codePostal"].setValue(villes[0].codePostal);
    } else {
      this.form.controls["codePostal"].setValue("");
    }
  }

  CheckUniqueReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.fournisseurService
        .CheckUniqueReference(control.value)
        .subscribe(res => {
          if (res == true) {
            resolve({ CheckUniqueReference: true });
          } else {
            resolve(null);
          }
        });
    });
    return promise;
  }

  removeContact(event) {
    this.contacts.splice(event.contactIndex, 1);
  }

  get f() { return this.form.controls; }

  generateReference() {
    this.paramteresService.Generate(this.typeNumerotation.fournisseur as number)
      .subscribe(res => {
        this.form.controls["reference"].setValue(res['data']);
      })
  }

  IncremenetRefernce() {
    this.paramteresService.Increment(this.typeNumerotation.fournisseur as number)
      .subscribe(res => { })
  }

  getListContacts(contacts) {
    this.contacts = contacts;
  }

  SearchVille(search) {
    this.villeService
      .Search(search, 1, 100, "VilleNom", "ASC")
      .subscribe(value => {
        this.villes = value.list;
      });
  }

  generateCodeComptable() {
    this.form.controls['codeComptable'].setValue(this.CodeComptable + this.f.nom.value.replace(/ /g, ''));
  }

  /**
   * Get parametrage plan comptable de fournisseur
   */
  GetCodeComptable(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Get(TypeParametrage.planComptable).subscribe(
        res => {
          const planComptableList: PlanComptableModel[] = JSON.parse(res.contenu) as PlanComptableModel[];
          const codeComptable: number = planComptableList.filter(x => x.id == PlanComptableEnum.fournisseur)[0].codeComptable as number;
          resolve(codeComptable);
        },
        err => {
          reject(err);
        }
      );

    });
  }
}
