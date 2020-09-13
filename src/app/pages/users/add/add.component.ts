import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormControl, FormGroup } from "@angular/forms";
import { UtilisateurService } from "app/services/users/user.service";
import { Router } from "@angular/router";
import { Historique } from "app/Models/Entities/Historique";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum"
import { LoginService } from "app/services/login/login.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { TypeNumerotation } from "app/Enums/TypeNumerotation.Enum";
import { Profile } from "app/Models/Entities/Profile";
import { UserProfile } from "app/Enums/user-profile.enum";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
declare var toastr: any;

@Component({
    selector: "app-add",
    templateUrl: "./add.component.html",
    styleUrls: ["./add.component.scss"]
})
export class AddComponent implements OnInit {

    public form: FormGroup;

    public typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
    userProfile: typeof UserProfile = UserProfile;
    constructor(
        private fb: FormBuilder,
        private utilisateurService: UtilisateurService,
        private router: Router,
        private translate: TranslateService,
        private actionHistorique: ActionHistorique,
        private loginService: LoginService,
        private paramteresService: ParameteresService
    ) {
        this.form = this.fb.group({
            nom: ["", [Validators.minLength(2), Validators.required]],
            prenom: ["", [Validators.minLength(2), Validators.required]],
            actif: [true],
            email: [null, [Validators.pattern(AppSettings.regexEmail)]],
            phonenumber: ["", [Validators.minLength(10), Validators.pattern(AppSettings.regexPhone)]],
            username: ["", [Validators.minLength(6), Validators.required]],
            password: ["", [Validators.minLength(6), Validators.required]],
            confirmpassword: ["", [Validators.minLength(6), Validators.required]],
            idprofile: ['', Validators.required],
            matricule: [null, [Validators.required]],
            typeTechnicien: [null]
        }, { validator: this.checkPasswords });
        this.generateReference();

        this.form.get('idprofile').valueChanges.subscribe(data => {
            if (data == this.userProfile.technicien) {
                this.form.get('typeTechnicien').setValidators([Validators.required]);
            }
        });
    }

    get f() { return this.form.controls; }

    checkPasswords(group: FormGroup) {
        let password = group.controls.password.value;
        let confirmPassword = group.controls.confirmpassword.value;
        return password === confirmPassword ? null : { notSame: true }
    }


    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.getProfiles();
    }
    public Profiles: Profile[] = [];
    public ProfilesTechnicien: Profile[] = [];
    getProfiles() {
        this.translate.get("labels").subscribe(labels => {
            this.Profiles.push({ id: UserProfile.admin, libelle: labels.admin });
            this.Profiles.push({ id: UserProfile.technicien, libelle: labels.technicien });
            this.Profiles.push({ id: UserProfile.manager, libelle: labels.manager });
            this.ProfilesTechnicien.push({ id: UserProfile.technicien, libelle: labels.technicien })
            this.ProfilesTechnicien.push({ id: UserProfile.technicienChantier, libelle: labels.technicienChantier })
            this.ProfilesTechnicien.push({ id: UserProfile.technicienMaintenance, libelle: labels.technicienmaintenace })
        });
    }

    add() {

        if (this.form.valid) {
            this.translate.get("add").subscribe(text => {
                let values = this.form.value;
                values.idprofile = values.idprofile == UserProfile.technicien ? values.typeTechnicien : values.idprofile;
                delete values.typeTechnicien;
                let historique = new Historique();
                historique.IdUser = this.loginService.getUser().id;
                historique.action = this.actionHistorique.Added;
                values["historique"] = JSON.stringify([historique]);
                values["actif"] = this.f.actif.value ? 1 : 0;
                this.utilisateurService.Add(values).subscribe(res => {
                    if (res) {
                        this.IncremenetRefernce();
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




    generateReference() {
        this.paramteresService.Generate(this.typeNumerotation.agent as number)
            .subscribe(res => {
                this.form.controls["matricule"].setValue(res['data']);
            })
    }

    IncremenetRefernce(): void {
        this.paramteresService.Increment(this.typeNumerotation.agent as number)
            .subscribe(res => { })
    }
}
