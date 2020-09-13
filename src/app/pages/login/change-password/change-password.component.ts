import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from './../../../services/login/login.service';
import { Router } from "@angular/router";
declare var toastr: any;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  public form: any;
  constructor(private translate: TranslateService, private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.form = this.fb.group({
      "password": ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }
  recover() {
    
    if (this.form.valid) {
      let password = this.form.controls.password.value;
      let user = JSON.parse(localStorage.getItem("PDB_USER"));
      this.loginService.changePassword(user.id, password).subscribe(res => {
        if (res) {
          this.router.navigate(['/']);
          toastr.success("Le mote de passe a été bien enregistré avec succès", "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        } else {
          toastr.warning("external error", "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    }
  }

}
