import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormControl } from "@angular/forms";
import { Departement } from "app/Models/Entities/Depatement";
import { Ville } from "app/Models/Entities/Ville";
import { Pays } from "app/Models/Entities/Pays";
import { VilleService } from "app/services/ville/ville.service";
import { DepartementService } from "app/services/departement/departement.service";
import { PaysService } from "app/services/pays/pays.service";
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Fournisseur } from "app/Models/Entities/Fournisseur";
import { Contact } from "app/Models/Entities/Contact";
import { Historique } from "app/Models/Entities/Historique";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum"
import { Memo } from "app/Models/Entities/Memo";
import { UtilisateurService } from "app/services/users/user.service";
import { User } from "app/Models/Entities/User";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
import { PlanComptableModel } from "app/Models/PlanComptableModel";
import { PlanComptableEnum } from "app/Enums/PlanComptable.Enum";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
declare var toastr: any;

@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"]
})
export class UpdateComponent implements OnInit {
  id;
  fournisseur: Fournisseur;
  form;
  departements: Departement[];
  villes: Ville[];
  pays: Pays[];
  contacts: Contact[];
  historiques: Historique[] = [];
  memos: Memo[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  afficherList = false; /* Afficher la liste des département et des villes si il a dans la bdd */
  CodeComptable
  constructor(
    private fb: FormBuilder,
    private departementService: DepartementService,
    private villeService: VilleService,
    private paysService: PaysService,
    private fournisseurService: FournisseurService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private paramteresService: ParameteresService,
  ) {
    this.form = this.fb.group({
      reference: ["", [Validators.required], this.CheckUniqueReference.bind(this)],
      nom: ["", [Validators.minLength(5), Validators.required]],
      idAgent: [null],
      idPays: ["", [Validators.required]],
      adresse: ["", Validators.required],
      complementAdresse: [""],
      ville: ["", [Validators.required]],
      codePostal: [""],
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

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.CodeComptable = await this.GetCodeComptable();
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.fournisseurService.Get(this.id).subscribe(value => {
        this.fournisseur = value;
        this.GetPays("");
        this.SearchVille("");
        this.GetDepartements(AppSettings.SHOW_CITY_OF_COUNTRY[0]);
        if (AppSettings.SHOW_CITY_OF_COUNTRY.filter(idPays => idPays == this.fournisseur.idPays).length > 0) {
          this.afficherList = true;
        }
        this.SetData();
      });
    });
  }
  generateCodeComptable() {
    this.form.controls['codeComptable'].setValue(this.CodeComptable + this.f.nom.value.replace(/ /g, ''));
  }

  GetDepartements(search) {
    this.afficherList = AppSettings.SHOW_CITY_OF_COUNTRY.filter(idPays => idPays == search).length > 0 ? true : false;
    this.villes = [];
    this.departements = [];
    this.departementService
      .GetAll(search, 1, AppSettings.MAX_GET_DATA, "DepartementNom", "ASC")
      .subscribe(value => {
        this.departements = value.list;
        this.GetVilles(this.fournisseur.departement);
      });
  }

  GetVilles(search) {

    try {
      let departement = this.departements.filter(x => x.departementNom == search)[0];
      this.villeService
        .GetAll(departement.id, 1, AppSettings.MAX_GET_DATA, "VilleNom", "ASC")
        .subscribe(value => {
          this.villes = value.list;
          (this.villes);
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



  SetData() {
    this.form.controls["reference"].setValue(this.fournisseur.reference);
    this.form.controls["nom"].setValue(this.fournisseur.nom);
    this.form.controls["idPays"].setValue(this.fournisseur.idPays);
    this.form.controls["adresse"].setValue(this.fournisseur.adresse);
    this.form.controls["complementAdresse"].setValue(this.fournisseur.complementAdresse);
    this.form.controls["ville"].setValue(this.fournisseur.ville);
    this.form.controls["codePostal"].setValue(this.fournisseur.codePostal);
    this.form.controls["departement"].setValue(this.fournisseur.departement);
    this.form.controls["telephone"].setValue(this.fournisseur.telephone);
    this.form.controls["fax"].setValue(this.fournisseur.fax);
    this.form.controls["email"].setValue(this.fournisseur.email);
    this.form.controls["siteWeb"].setValue(this.fournisseur.siteWeb);
    this.form.controls["siret"].setValue(this.fournisseur.siret);
    this.form.controls["tvaIntraCommunautaire"].setValue(this.fournisseur.tvaIntraCommunautaire);
    this.form.controls["codeComptable"].setValue(this.fournisseur.codeComptable);
    this.contacts = JSON.parse(this.fournisseur.contacts) as Contact[];
    this.historiques = JSON.parse(this.fournisseur.historique) as Historique[];
    this.memos = JSON.parse(this.fournisseur.memos) as Memo[];
  }

  update() {
    if (this.form.valid) {
      this.translate.get("update").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["id"] = this.id;
        values["contacts"] = JSON.stringify(this.contacts);
        values["historique"] = JSON.stringify(this.historiques);
        values["memos"] = JSON.stringify(this.memos);
        (values);
        this.fournisseurService.Update(this.id, values).subscribe(res => {
          if (res) {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/fournisseurs/detail", this.id]);
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
          if (res == true && this.fournisseur.reference != control.value) {
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

  informationsContactsChange(contacts: Contact[]) {
    this.contacts = contacts;
  }

  get f() {
    return this.form.controls;
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
  /**
* Get parametrage plan comptable de client
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
