import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoginService } from '../../services/login/login.service';
import { TranslateService } from "@ngx-translate/core";
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private loginService: LoginService, private translate: TranslateService) { }

  ngOnInit() {
  }

  checkPasswords(group: FormGroup) {
    let password = group.controls.password.value;
    let confirmPassword = group.controls.confirmPassword.value;
    return password === confirmPassword ? null : { notSame: true }
  }

  changePasswordForm = this.formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(5)]],
    confirmPassword: ['']
  }, { validator: this.checkPasswords })

  change() {
    if (this.changePasswordForm.valid) {
      let userId = localStorage.getItem("SBP_changePassword_UserId");
      this.loginService.changePassword(parseInt(userId), this.changePasswordForm.value.password).subscribe(res => {
        this.translate.get("changePassword").subscribe(text => {
          toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
        jQuery("#changePassword").modal("hide");
        jQuery('#changePassword').modal({
          backdrop: 'static',
          keyboard: false  // to prevent closing with Esc button (if you want this too)
        })
      });
    }
  }

  rest() {
    this.changePasswordForm.controls["password"].setValue(null);
    this.changePasswordForm.controls["confirmPassword"].setValue(null);

  }

}
