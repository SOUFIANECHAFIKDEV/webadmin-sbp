import { Component, OnInit } from "@angular/core";
import { Validators, FormBuilder, FormControl } from "@angular/forms";
import { UtilisateurService } from "app/services/users/user.service";
import { Router, ActivatedRoute } from "@angular/router";
import { User } from "app/Models/Entities/User";
import { Contact } from "app/Models/Entities/Contact";
import { Historique } from "app/Models/Entities/Historique";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum"
import { LoginService } from "app/services/login/login.service";
import { UserProfile } from "app/Enums/user-profile.enum";
import { Profile } from "app/Models/Entities/Profile";
declare var toastr: any;

@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"]
})
export class UpdateComponent implements OnInit {
  id;
  user: User;
  form;
  historiques: Historique[] = [];
  userProfile: typeof UserProfile = UserProfile;

  constructor(
    private utilisateurService: UtilisateurService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private actionHistorique: ActionHistorique,
    private loginService: LoginService
  ) {
    this.form = this.fb.group({
      id: [""],
      nom: ["", [Validators.minLength(2), Validators.required]],
      prenom: ["", [Validators.minLength(2), Validators.required]],
      actif: [true],
      email: [null, [Validators.pattern(AppSettings.regexEmail)]],
      phonenumber: ["", [Validators.minLength(10), Validators.pattern(AppSettings.regexPhone)]],
      username: ["", [Validators.minLength(6), Validators.required]],
      matricule: ['', [Validators.required]],
      idProfile: ['', [Validators.required]],
      typeTechnicien: [null]
    });

  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.utilisateurService.Get(this.id).subscribe(value => {
        this.user = value;
        this.getProfiles();
        this.SetData();
      });
    });

  }



  SetData() {

    this.form.controls["id"].setValue(this.user.id);
    this.form.controls["nom"].setValue(this.user.nom);
    this.form.controls["prenom"].setValue(this.user.prenom);
    this.form.controls["actif"].setValue(this.user.actif);
    this.form.controls["email"].setValue(this.user.email);
    this.form.controls["phonenumber"].setValue(this.user.phonenumber);
    this.form.controls["username"].setValue(this.user.username);
    this.form.controls["matricule"].setValue(this.user.matricule);
    if (this.user.idProfile != this.userProfile.technicien && this.user.idProfile != this.userProfile.technicienChantier && this.user.idProfile != this.userProfile.technicienMaintenance) {
      this.form.controls["idProfile"].setValue(this.user.idProfile.toString());
    } else {
      this.form.controls["idProfile"].setValue(this.userProfile.technicien.toString());
      this.form.controls["typeTechnicien"].setValue(this.user.idProfile.toString());
    }
    this.form.get('idprofile').valueChanges.subscribe(data => {
      if (data == this.userProfile.technicien) {
        this.form.get('typeTechnicien').setValidators([Validators.required]);
      }
    });



  }

  update() {
    if (this.form.valid) {
      this.translate.get("update").subscribe(text => {
        debugger
        let values = this.form.value;
        values.idprofile = values.idprofile == values.typeTechnicien != null ? values.typeTechnicien : values.idprofile;
        delete values.typeTechnicien;
        values["id"] = this.id;

        // let historique = new Historique();
        // historique.IdUser = JSON.parse(localStorage.getItem("PDB_USER")).id
        // historique.IdUser = this.loginService.getUser().id;
        // historique.action = this.actionHistorique.Updated
        // this.historiques.push(historique);

        values["historique"] = JSON.stringify(this.historiques);
        values["UserProfile"] = [
          { "Iduser": parseInt(values["id"]), "Idprofile": values["UserProfile"] }
        ];
        // values["UserProfile"] = JSON.stringify(values["UserProfile"]);
        values["actif"] = values["actif"] ? 1 : 0;
        this.utilisateurService.Update(values).subscribe(res => {
          if (res) {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/utilisateurs/detail", res.id]);
          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }


  get f() {
    return this.form.controls;
  }
  public Profiles: any[] = [];
  public ProfilesTechnicien: Profile[] = [];
  getProfiles() {

    this.translate.get("labels").subscribe(labels => {
      this.Profiles.push({ id: UserProfile.admin.toString(), libelle: labels.admin });
      this.Profiles.push({ id: UserProfile.technicien.toString(), libelle: labels.technicien });
      this.Profiles.push({ id: UserProfile.manager.toString(), libelle: labels.manager });
      this.ProfilesTechnicien.push({ id: UserProfile.technicien, libelle: labels.technicien })
      this.ProfilesTechnicien.push({ id: UserProfile.technicienChantier, libelle: labels.technicienChantier })
      this.ProfilesTechnicien.push({ id: UserProfile.technicienMaintenance, libelle: labels.technicienmaintenace })

    });
  }
}
