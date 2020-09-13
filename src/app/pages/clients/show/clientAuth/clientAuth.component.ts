import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from "@angular/forms";
import { UtilisateurService } from "app/services/users/user.service";
import { ClientService } from './../../../../services/client/client.service';
import { User } from './../../../../Models/Entities/User';
import { Client } from './../../../../Models/Entities/Client';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
declare var toastr: any;
declare var swal: any;

@Component({
  selector: 'client-Auth',
  templateUrl: './clientAuth.component.html',
  styleUrls: ['./clientAuth.component.scss']
})
export class ClientAuthComponent implements OnInit, OnChanges {

  @Input('client') public client: Client;
  @Output('userClientIsActif') public userClientIsActif = new EventEmitter();
  public insertOrUpdate: boolean = false;
  public form: FormGroup;
  public defaultUsername = "";
  public userClient: User;
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private utilisateurService: UtilisateurService,
    private clientService: ClientService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.createForm(false, "", "");
  }

  ngOnChanges() {

    if (this.client !== undefined) {
      this.getUserClientInfos(this.client.id);
    }
  }

  /**  créer un formulaire initialiser a partir du base de donnée  */
  createForm(actifV: boolean, usernameV: string, passwordV: string): void {
    this.form = this.fb.group({
      actif: [actifV],
      username: [usernameV, [Validators.minLength(4), Validators.required], this.CheckUniqueUserName.bind(this)],
      password: [passwordV, [Validators.minLength(6), Validators.required]],
    });
  }

  CheckUniqueUserName(control: FormControl) {
    try {
      if (control.value != "" && control.value != this.defaultUsername) {
        let promise = new Promise((resolve, reject) => {
          this.utilisateurService
            .CheckUniqueUserName(control.value)
            .subscribe(res => {
              if (res == true) {
                resolve({ CheckUniqueUserName: true });
              } else {
                resolve(null);
              }
            });
        });
        return promise;
      } else {
        return new Promise((resolve, reject) => { resolve(null) })
      }
    } catch (err) {
      console.log(err);
    }
  }

  get f() { return this.form.controls; }

  getUserClientInfos(clientId) {

    this.loading = true;
    this.utilisateurService.getUserClientInfos(clientId).subscribe((Response: User) => {
      this.loading = false;
      if (Response == null) {
        this.userClientIsActif.emit(false);
        this.insertOrUpdate = true;
        return;
      }
      this.insertOrUpdate = false;
      this.userClient = Response;
      this.defaultUsername = Response.username;
      let isActif = Response.actif == 0 ? false : true;
      this.userClientIsActif.emit(isActif);
      this.form.controls.actif.setValue(isActif)
      this.form.controls.username.setValue(Response.username)
    }, error => {
      this.loading = false;
      console.log(error);
    })
  }

  saveInfos() {

    if (this.form.invalid) {
      return;
    }
    if (this.insertOrUpdate) {
      this.addUser();
    } else {
      this.updateUser(this.userClient.id);
    }
  }

  addUser() {

    this.loading = true;
    this.utilisateurService.Add(this.createBodyRequest()).subscribe(res => {
      this.translate.get("update").subscribe(text => {
        swal(text.msg, "", "success");
        this.insertOrUpdate = false;
        this.userClient = res;
        this.defaultUsername = res.username;
        let isActif = res.actif == 0 ? false : true;
        this.userClientIsActif.emit(isActif);
        this.form.controls.actif.setValue(isActif)
        this.form.controls.username.setValue(res.username)
        this.loading = false;
      })
    }, err => {
      this.translate.get("delete").subscribe(text => {
        swal(text.error, "", "error");
        this.loading = false;
      })
    });
  }

  updateUser(idUser: number) {

    this.loading = true;
    this.utilisateurService.Update(this.createBodyRequest(idUser)).subscribe(res => {
      this.translate.get("update").subscribe(text => {
        swal(text.msg, "", "success");
        this.loading = false;
      })
    }, err => {
      this.translate.get("delete").subscribe(text => {
        swal(text.error, "", "error");
        this.loading = false;
      })
    });
  }

  createBodyRequest(id?: number) {

    let date = new Date();
    const user = {
      id: (id == null ? 0 : id),
      username: this.form.value.username,
      password: this.form.value.password,
      actif: this.form.value.actif ? 1 : 0,
      nom: this.client.nom,
      email: this.client.email,
      prenom: "",
      codecomptable: this.client.codeComptable,
      accessfailedcount: 0,
      phonenumber: this.client.telephone,
      userProfile: [{
        Idprofile: UserProfile.client,
        IdprofileNavigation: null,
        Iduser: 0,
        IduserNavigation: null
      }],
      historique: '[]',
      dernierecon: null,
      matricule: '',
      joinDate: date,
      idClient: this.client.id,
      idProfile: UserProfile.client,
    };
    return user;
  }
}