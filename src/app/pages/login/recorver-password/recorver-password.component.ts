import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from 'app/services/login/login.service';
import { Router } from '@angular/router';
declare var toastr: any;

@Component({
  selector: 'app-recorver-password',
  templateUrl: './recorver-password.component.html',
  styleUrls: ['./recorver-password.component.scss']
})
export class RecorverPasswordComponent implements OnInit {

  form

  constructor(private translate: TranslateService, private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.form = this.fb.group({
      "email": ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  recover() {
    if (this.form.valid) {
      this.translate.get('recover').subscribe(text => {
        this.loginService.recoverAccount(this.form.value.email,text.subject,text.body)
          .subscribe(res => {
            if (!res) {
              this.translate.get("recover").subscribe(text => {
                toastr.error(text.error, "", {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
              })
            } else {
              this.router.navigate(['/login'])
            }
          }, err => {
            if(err.status){
              toastr.error(text.notExist, "", {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
            }else{
              toastr.error(text.error, "", {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
            }
          })
      })
    }
  }

  get f() { return this.form.controls; }
}
