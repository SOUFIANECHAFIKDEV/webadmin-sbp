import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { ChangePasswordComponent } from './change-password.component';
import { LoginService } from '../../services/login/login.service';




export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/common/", ".json");
}

@NgModule({
    exports: [
        ChangePasswordComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgbModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        ShowHidePasswordModule
    ],
    declarations: [
        ChangePasswordComponent
    ],
    providers: [
        LoginService
    ]
})
export class changePasswordModule { } 
