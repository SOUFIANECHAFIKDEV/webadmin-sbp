import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { LoginService } from 'app/services/login/login.service';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { UserStatut } from 'app/Enums/UserStatut.enum';
declare var toastr: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userProfile: typeof UserProfile = UserProfile

  constructor(private loginService: LoginService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  login(UserName: HTMLInputElement, Password: HTMLInputElement) {
    
    this.translate.get("login").subscribe(text => {
      this.loginService.Login(UserName.value, Password.value)
        .subscribe(
          response => {
            const profiles = [
              //this.userProfile.technicien,
              this.userProfile.admin,
              this.userProfile.manager,
            ];
            let checkProfileAccess = profiles.includes(response.user.idProfile);
            if (!checkProfileAccess) {
              toastr.warning(text.accesnonautorise, { positionClass: 'toast-top-center', containerId: 'toast-top-center' })
              return
            } else if (response && response.token && response.user.passwordAlreadyChanged == 1 && response.user.actif == UserStatut.active) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('PDB_USER', JSON.stringify(response.user));
              this.router.navigate(['/']);
            } else if (response && response.token && response.user.passwordAlreadyChanged == 0 && response.user.actif == UserStatut.active) {
              localStorage.setItem('token', response.token);
              localStorage.setItem('PDB_USER', JSON.stringify(response.user));
              this.router.navigate(['/login/change-password']);
            } else {
              toastr.warning(text.incorrectLogin, { positionClass: 'toast-top-center', containerId: 'toast-top-center' })
            }
          },
          error => {
            toastr.warning(text.incorrectLogin, { positionClass: 'toast-top-center', containerId: 'toast-top-center' })
          });
    })
  }
}