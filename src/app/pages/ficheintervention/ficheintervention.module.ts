import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from '@ng-select/ng-select';



import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DepartementService } from "app/services/departement/departement.service";
import { VilleService } from "app/services/ville/ville.service";
import { PaysService } from "app/services/pays/pays.service";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { CommonModules } from '../../common/common.module';
import { UtilisateurService } from "../../services/users/user.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { FicheInterventionService } from "app/services/ficheIntervention/fiche-intervention.service";
import { FicheinterventionRoutingModule } from "./ficheintervention-routing.module";
import { IndexComponent } from "./index/index.component";
import { ShowComponent } from "./show/show.component";
import { UpdateComponent } from "./update/update.component";
import { AddComponent } from "./add/add.component";
import { InformationsComponent } from "./show/informations/informations.component";
import { TableArticleModule } from "app/common/table-article/table-article.module";
import { ChantierService } from "app/services/chantier/chantier.service";
import { ClientService } from "app/services/client/client.service";
import { LoginService } from "app/services/login/login.service";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { CalendarModule, SplitButtonModule } from "app/custom-module/primeng/primeng";
import { SelectUserModule } from "app/common/select-user/select-user.module";
import { ClientsModule } from "../clients/clients.module";
import { ChantierModule } from "../chantier/chantier.module";
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/ficheintervention/", ".json");
}

@NgModule({
  providers: [
    ChantierService,
    ParameteresService,
    FicheInterventionService,
    ClientService,
    LoginService,
    DepartementService,
    VilleService,
    PaysService,
    UtilisateurService,
    ParameteresService,
    PreviousRouteService,
  ],
  imports: [
    CommonModule,
    FicheinterventionRoutingModule,
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
    NgbTooltipModule,
    ReactiveFormsModule,
    DataTablesModule,
    CommonModules,
    NgbTooltipModule,
    AngularEditorModule,
    TableArticleModule,
    ChantierModule,
    ClientsModule,
    CommonModules,
    CommonModule,
    CalendarModule,
    SplitButtonModule,
    TableArticleModule,
    AngularEditorModule,
    CalendarModule,
    SelectUserModule
  ],
  declarations: [IndexComponent, ShowComponent, UpdateComponent, AddComponent, InformationsComponent]
})


export class FicheinterventionModule { }
