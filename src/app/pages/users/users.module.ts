import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UtilisateurRoutingModule } from "./users-routing.module";
import { IndexComponent } from "./index/index.component";
import { ShowComponent } from "./show/show.component";
import { UpdateComponent } from "./update/update.component";
import { AddComponent } from "./add/add.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DepartementService } from "app/services/departement/departement.service";
import { VilleService } from "app/services/ville/ville.service";
import { PaysService } from "app/services/pays/pays.service";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { UtilisateurService } from "app/services/users/user.service";
import { InformationComponent } from "./show/information/information.component";
import { UsersProfil } from "./../../Enums/UserProfil.Enum";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModules } from './../../common/common.module';
import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { changePasswordModule } from 'app/common/change-password/change-password.module';

import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/users/", ".json");
}

@NgModule({
    providers: [
        UtilisateurService,
        DepartementService,
        VilleService,
        PaysService,
        UsersProfil,
        PreviousRouteService
    ],
    imports: [
        CommonModules,
        CommonModule,
        UtilisateurRoutingModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            isolate: true
        }),
        FormsModule,
        ReactiveFormsModule,
        DataTablesModule,
        NgSelectModule,
        NgbTooltipModule,
        ShowHidePasswordModule.forRoot(),
        changePasswordModule
    ],
    declarations: [IndexComponent, ShowComponent, UpdateComponent, InformationComponent, ShowComponent, AddComponent]
})
export class UtilisateurModule { }
