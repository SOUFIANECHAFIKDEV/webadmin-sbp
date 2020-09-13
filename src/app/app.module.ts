
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from "./shared/shared.module";
import { CommonModules } from './common/common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { AppComponent } from './app.component';
import { DashboardLayoutComponent } from './layouts/dashboard/dashboard.component';
import { loginLayoutComponent } from "./layouts/login/login.component";
import { AuthService } from './shared/auth/auth.service';

import { AuthGuard } from './shared/auth/auth-guard.service';
import { BrowserModule } from '@angular/platform-browser';
import * as $ from 'jquery';

// import ngx-translate and the http loader
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';





export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/shared/", ".json");
}

@NgModule({
    declarations: [
        AppComponent,
        DashboardLayoutComponent,
        loginLayoutComponent,




    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
        CommonModules,
        HttpClientModule,
        NgbModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            isolate: true
        })
    ],
    providers: [
        AuthService,
        AuthGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }