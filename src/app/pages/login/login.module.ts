import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoginComponent } from './connecter/login.component';
import { RecorverPasswordComponent } from './recorver-password/recorver-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ShowHidePasswordModule } from 'ngx-show-hide-password';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/login/", ".json");
}


@NgModule({
  declarations: [LoginComponent, RecorverPasswordComponent, ChangePasswordComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    ReactiveFormsModule,
    ShowHidePasswordModule
  ]
})
export class LoginModule { }
