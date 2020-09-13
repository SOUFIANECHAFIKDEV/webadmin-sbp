import { Component, OnInit, Input, Inject } from "@angular/core";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { Contact } from "app/Models/Entities/Contact";
import { Adresse } from "app/Models/Entities/Adresse";
import { ClientService } from "app/services/client/client.service";
import { Historique } from "app/Models/Entities/Historique";
import { AppSettings } from "app/app-settings/app-settings";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum"
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
import { LoginService } from "app/services/login/login.service";
import { UtilisateurService } from "app/services/users/user.service";
import { User } from "app/Models/Entities/User";
import { GroupesService } from "app/services/groupe/groupe.service";
import { Groupe } from "app/Models/Entities/Groupe";
import { TypeNumerotation } from "app/Enums/TypeNumerotation.Enum";
import { UserProfile } from "app/Enums/user-profile.enum";
import { PlanComptableModel } from "app/Models/PlanComptableModel";
import { PlanComptableEnum } from "app/Enums/PlanComptable.Enum";
declare var toastr: any;

@Component({
  selector: "app-add-client",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"]
})
export class AddComponent implements OnInit {
  form;
  contacts: Contact[] = [];
  adresses: Adresse[] = [];
  public adresseclient = [];

  actionHistorique: ActionHistorique = new ActionHistorique();
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  agents: User[] = [];
  groupes: Groupe[] = [];
  processing: boolean = false;
  CodeComptable

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private translate: TranslateService,
    private paramteresService: ParameteresService,
    private loginService: LoginService,
    private utilisateurService: UtilisateurService,
    private groupesService: GroupesService
  ) {

  }

  async createForm() {
    this.form = this.fb.group({
      nom: ['', [Validators.minLength(2), Validators.required]],
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
      IdGroupe: [null]
    });
  }

  /** --------------------------------------------------
    @description initialiser le formulaire de création
    -------------------------------------------------- */
  async initializeCreationForm() {
    this.form.controls['codeclient'].setValue(await this.generateCodeclient());
    this.form.controls['codeComptable'].setValue(this.CodeComptable);
  }


  async ngOnInit() {
    debugger
    this.processing = true;
    await this.createForm();
    this.CodeComptable = await this.GetCodeComptable();
    await this.initializeCreationForm();
    await this.generate_Codeclient();
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetAgents();
    this.getGroupes();

    this.processing = false;
  }


  CheckUniqueCodeClient(control: FormControl) {

    if (control.value != "") {
      let promise = new Promise((resolve, reject) => {
        this.clientService
          .CheckUniqueCodeClient(control.value)
          .subscribe(res => {
            if (res == true) {
              resolve({ CheckUniqueCodeClient: true });
            } else {
              resolve(null);
            }
          });
      });
      return promise;
    }
  }


  removeContact(event) {
    this.contacts.splice(event.contactIndex, 1);
  }

  removeAdresse(i) {
    this.adresses.splice(i, 1);
  }

  add() {
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

      this.translate.get("add").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["contacts"] = JSON.stringify(this.contacts);

        values["adresses"] = JSON.stringify(this.adresses);

        let historique = new Historique();
        historique.IdUser = this.loginService.getUser().id;
        historique.action = this.actionHistorique.Added;
        values["historique"] = JSON.stringify([historique]);
        values["memos"] = JSON.stringify([]);

        this.clientService.Add(values).subscribe(res => {
          if (res) {
            this.IncremenetCodeclient()
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/clients/detail", res.id]);
          }
        });
      })
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  get f() { return this.form.controls; }

  generate_Codeclient() {
    this.processing = true;
    this.paramteresService.Generate(this.typeNumerotation.client as number)
      .subscribe(res => {
        this.form.controls["codeclient"].setValue(res['data']);
        this.processing = false;
      })
  }

  /**
  * return a reference for the new insertion
  */
  generateCodeclient(): Promise<string> {

    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.client as number).subscribe(
        res => {

          reslove(res['data'] as string);
        },
        err => {
          (err);
        }
      );
    });
  }






  IncremenetCodeclient() {
    this.paramteresService.Increment(this.typeNumerotation.client as number)
      .subscribe(res => { })
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

  generateCodeComptable() {
    this.form.controls['codeComptable'].setValue(this.CodeComptable + this.f.nom.value.replace(/ /g, ''));
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
