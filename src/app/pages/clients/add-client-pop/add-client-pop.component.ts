import { Component, OnInit, Input, Inject, Output, EventEmitter } from "@angular/core";
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

declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'app-add-client-pop',
  templateUrl: './add-client-pop.component.html',
  styleUrls: ['./add-client-pop.component.scss']
})
export class AddClientPopComponent implements OnInit {
  form;
  contacts: Contact[] = [];
  adresses: Adresse[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  agents: User[] = [];
  groupes: Groupe[] = [];
  @Output('retrunClient') retrunNewClient = new EventEmitter();
  initialisation = {
    groupe: false,
    agent: false,
    codeclient: false
  }
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

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
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
      this.translate.get("addClient").subscribe(text => {
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
            jQuery("#add_client_modal").modal("hide");
            this.retrunNewClient.emit(res);
            this.form.reset();
            this.contacts = [];
            this.adresses = [];
          }
        }, err => {
          this.translate.get("errors").subscribe(text => {
            toastr.warning(text.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          })
        });
      })
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  get f() { return this.form.controls; }

  generateCodeclient() {
    if (!this.initialisation.codeclient) {
      this.paramteresService.Generate(this.typeNumerotation.client as number)
        .subscribe(res => {
          this.form.controls["codeclient"].setValue(res['data']);
          this.initialisation.codeclient = true;
        });
    }
  }

  IncremenetCodeclient() {
    this.paramteresService.Increment(this.typeNumerotation.client as number)
      .subscribe(res => { })
  }

  getListContacts(contacts) {
    this.contacts = contacts;
  }

  getListAdressesAAA(adresses) {

    this.adresses = adresses;
  }

  GetAgents() {
    if (!this.initialisation.agent) {
      this.utilisateurService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "ASC", [UserProfile.technicien])
        .subscribe(value => {
          this.agents = value.list;
          this.initialisation.agent = true;
        });
    }
  }

  generateCodeComptable() {
    this.form.controls['codeComptable'].setValue(this.f.nom.value.replace(/ /g, ''));
  }

  getGroupes() {
    if (!this.initialisation.groupe) {
      this.groupesService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "asc").subscribe(res => {
        this.groupes = res.list;
        this.initialisation.groupe = true;
      }, err => {
        (err);
      })

    }
  }

  close() {
    jQuery("#add_client_modal").modal("hide");
  }
}