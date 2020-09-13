import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'app/services/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { User } from './../../Models/Entities/User'
@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    user: any;
    constructor(private router: Router, private loginService: LoginService, private translate: TranslateService) {

    }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.user = JSON.parse(localStorage.getItem("PDB_USER"));
    }

    logout() {
        this.loginService.logout()
        this.router.navigate(['/login'])
    }

    getProfile() {
        this.router.navigate([`utilisateurs/detail/${this.user.id}`])
    }
    setUserIdInlocalStorage(id: number) {
        localStorage.setItem("SBP_changePassword_UserId", id.toString());
    }
}
