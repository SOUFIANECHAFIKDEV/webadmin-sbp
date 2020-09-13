import { Component, OnInit } from "@angular/core";
import { Client } from "app/Models/Entities/Client";
import { Contact } from "app/Models/Entities/Contact";
import { Historique } from "app/Models/Entities/Historique";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { ClientService } from "app/services/client/client.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AppSettings } from "app/app-settings/app-settings";
import { Adresse } from "app/Models/Entities/Adresse";
import { TranslateService } from "@ngx-translate/core";
import { Memo } from "app/Models/Entities/Memo";
import { User } from "app/Models/Entities/User";
import { UtilisateurService } from "app/services/users/user.service";
import { GroupesService } from "app/services/groupe/groupe.service";
import { Groupe } from "app/Models/Entities/Groupe";
import { UserProfile } from "app/Enums/user-profile.enum";
import { PlanComptableModel } from "app/Models/PlanComptableModel";
import { PlanComptableEnum } from "app/Enums/PlanComptable.Enum";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
declare var toastr: any;

@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"]
})
export class UpdateComponent implements OnInit {
  id;
  client: Client;
  form;
  contacts: Contact[];
  historiques: Historique[] = [];
  adresses: Adresse[] = [];
  memos: Memo[] = [];
  agents: User[] = [];
  afficherList = false; /* Afficher la liste des département et des villes si il a dans la bdd */
  groupes: Groupe[] = [];
  CodeComptable


  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private utilisateurService: UtilisateurService,
    private groupesService: GroupesService,
    private paramteresService: ParameteresService,
  ) {
    this.form = this.fb.group({
      nom: [null, [Validators.minLength(1), Validators.required]],
      codeclient: [null, [Validators.required], this.CheckUniqueCodeClient.bind(this)],
      reference: [null],
      telephone: [null, [Validators.minLength(10), Validators.pattern(AppSettings.regexPhone)]],
      fax: [null, [Validators.pattern(AppSettings.regexPhone)]],
      email: [null, [Validators.pattern(AppSettings.regexEmail)]],
      siteWeb: [null, [Validators.pattern(AppSettings.regexURL)]],
      siret: [null],
      tvaIntraCommunautaire: [null],
      codeComptable: [null],
      idAgent: [null],
      idGroupe: [null]
    });
  }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetAgents();
    this.getGroupes();
    this.CodeComptable = await this.GetCodeComptable();
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.clientService.Get(this.id).subscribe(value => {
        this.client = value;
        this.SetData();
      });
    });
  }

  SetData() {
    this.form.controls["reference"].setValue(this.client.reference);
    this.form.controls["codeclient"].setValue(this.client.codeclient);
    this.form.controls["nom"].setValue(this.client.nom);
    this.form.controls["telephone"].setValue(this.client.telephone);
    this.form.controls["fax"].setValue(this.client.fax);
    this.form.controls["email"].setValue(this.client.email);
    this.form.controls["siteWeb"].setValue(this.client.siteWeb);
    this.form.controls["siret"].setValue(this.client.siret);
    this.form.controls["tvaIntraCommunautaire"].setValue(this.client.tvaIntraCommunautaire);
    this.form.controls["codeComptable"].setValue(this.client.codeComptable);
    this.form.controls["idAgent"].setValue(this.client.idAgent != null ? this.client.idAgent.toString() : "");
    this.form.controls["idGroupe"].setValue(this.client.idGroupe != null ? this.client.idGroupe.toString() : null);
    this.contacts = JSON.parse(this.client.contacts) as Contact[];
    this.historiques = JSON.parse(this.client.historique) as Historique[];
    this.adresses = JSON.parse(this.client.adresses) as Adresse[];
    this.memos = JSON.parse(this.client.memos) as Memo[];
  }
  generateCodeComptable() {
    this.form.controls['codeComptable'].setValue(this.CodeComptable + this.f.nom.value.replace(/ /g, ''));
  }


  update() {
    if (this.adresses.length == 0) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.adresseRequired, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return
    }
    if (this.adresses.filter(x => x.default == true).length == 0) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.adresseDefaultRequired, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
      return
    }
    if (this.form.valid) {
      this.translate.get("update").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["id"] = this.id;
        values["contacts"] = JSON.stringify(this.contacts);
        values["adresses"] = JSON.stringify(this.adresses);
        values["historique"] = JSON.stringify(this.historiques);
        values["memos"] = JSON.stringify(this.memos);
        this.clientService.Update(this.id, values).subscribe(
          res => {
            if (res) {
              toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              this.router.navigate(["/clients/detail", this.id]);
            }
          }
        );
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  CheckUniqueCodeClient(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.clientService.CheckUniqueCodeClient(control.value).subscribe(res => {
        if (res == true && this.client.codeclient != control.value) {
          resolve({ CheckUniqueCodeClient: true });
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

  removeAdresse(event) {

    this.adresses.splice(event.addressIndex, 1);
  }

  get f() {
    return this.form.controls;
  }

  getListContacts(contacts) {
    this.contacts = contacts;
  }

  getListAdresses(adresses) {
    this.adresses = adresses;
  }

  GetAgents() {
    this.utilisateurService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "ASC", [UserProfile.technicien])
      .subscribe(value => {
        this.agents = value.list;
      });
  }

  getGroupes() {
    this.groupesService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "asc").subscribe(res => {
      this.groupes = res.list;
    }, err => {
      (err);
    })
  }
  /**
 * Get parametrage plan comptable de client
 */
  GetCodeComptable(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Get(TypeParametrage.planComptable).subscribe(
        res => {
          const planComptableList: PlanComptableModel[] = JSON.parse(res.contenu) as PlanComptableModel[];
          const codeComptable: number = planComptableList.filter(x => x.id == PlanComptableEnum.client)[0].codeComptable as number;
          resolve(codeComptable);
        },
        err => {
          reject(err);
        }
      );

    });
  }
}
