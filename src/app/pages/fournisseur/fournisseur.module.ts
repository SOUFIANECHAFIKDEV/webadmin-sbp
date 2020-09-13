import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from '@ng-select/ng-select';
import { FournisseurRoutingModule } from "./fournisseur-routing.module";
import { IndexComponent } from "./index/index.component";
import { ShowComponent } from "./show/show.component";
import { UpdateComponent } from "./update/update.component";
import { AddComponent } from "./add/add.component";
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DepartementService } from "app/services/departement/departement.service";
import { VilleService } from "app/services/ville/ville.service";
import { PaysService } from "app/services/pays/pays.service";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { InformationComponent } from './show/information/information.component';
import { CommonModules } from './../../common/common.module';
import { UtilisateurService } from "./../../services/users/user.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/fournisseurs/", ".json");
}

@NgModule({
  providers: [
    FournisseurService,
    DepartementService,
    VilleService,
    PaysService,
    UtilisateurService,
    ParameteresService,
    PreviousRouteService
  ],
  imports: [
    CommonModule,
    FournisseurRoutingModule,
    NgSelectModule,
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
    CommonModules,
    NgbTooltipModule
  ],
  declarations: [IndexComponent, ShowComponent, UpdateComponent, AddComponent, InformationComponent]
})
export class FournisseurModule { }
