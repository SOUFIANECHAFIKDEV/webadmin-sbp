import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
declare var toastr: any;
@Component({
  selector: 'app-messagerie',
  templateUrl: './messagerie.component.html',
  styleUrls: ['./messagerie.component.scss']
})
export class MessagerieComponent implements OnInit {

  form;
  //configMessagerie: ConfigMessagerie

  constructor(private translate: TranslateService, private fb: FormBuilder, private loginService: LoginService, private parameteresService: ParameteresService) {
    this.form = this.fb.group({
      "username": ["", [Validators.required]],
      "password": ["", [Validators.required]],
      "serveur": ["", [Validators.required, Validators.pattern(AppSettings.regexURL)]],
      "port": ["", [Validators.required]],
      "ssl": [false, [Validators.required]],
    })
  }


  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetMessagerie();
  }
  GetMessagerie() {
    
    this.parameteresService.Get(TypeParametrage.configMessagerie).subscribe(res => {
      const data = JSON.parse(res.contenu);
      this.form.controls['username'].setValue(data['username']);
      this.form.controls['password'].setValue(data['password']);
      this.form.controls['serveur'].setValue(data['server']);
      this.form.controls['port'].setValue(data['port']);
      this.form.controls['ssl'].setValue(data['ssl'] == 0 ? false : true);

    });
  }

  get f() { return this.form.controls; }

  update() {
    
    (this.form.value.ssl);
    const username = this.form.value.username;
    const password = this.form.value.password;
    const server = this.form.value.serveur;
    const port = this.form.value.port;
    let ssl: any;
    if (this.form.value.ssl == true) {
      ssl = 1;
    }
    else if (this.form.value.ssl == false)
    {
      ssl = 0;
    }

    (TypeParametrage.configMessagerie);
    this.parameteresService.Update(TypeParametrage.configMessagerie, JSON.stringify({ username, password, server, port, ssl })).subscribe(res => {
      
      this.translate.get("labels").subscribe(text => {
        toastr.success("", text.modifierSuccess, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      this.GetMessagerie();
    })
  }
}
