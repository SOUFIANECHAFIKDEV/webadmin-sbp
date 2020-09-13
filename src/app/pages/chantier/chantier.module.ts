import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from '@ng-select/ng-select';
import { ChantierRoutingModule } from "./chantier-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CommonModules } from '../../common/common.module';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { CalendarModule, ChartModule, SplitButtonModule } from "app/custom-module/primeng/primeng";

/**
 * custom components
 */
import { IndexComponent } from "./chantier-index/chantier-index.component";
import { ChantierComponent } from "./chantier-details/chantier-information/chantier-information.component";
import { ShowComponent } from './chantier-details/chantier-details.component';

/**
 * custom Modules
 */
import { ClientsModule } from "../clients/clients.module";
import { TableArticleModule } from "app/common/table-article/table-article.module";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { AddChantierFormModule } from "app/common/chantier-form/add-chantier-form.module";
import { DevisModule } from "../devis/devis.module";
import { RebriqueModule } from "./rebrique/rebrique.module";

/** 
 * services
 */
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { DepartementService } from "app/services/departement/departement.service";
import { VilleService } from "app/services/ville/ville.service";
import { PaysService } from "app/services/pays/pays.service";
import { UtilisateurService } from "../../services/users/user.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { DocumentAttacherService } from "app/services/documentAttacher/document-attacher.service";
import { ChantierService } from "app/services/chantier/chantier.service";
import { FacturesModule } from "../factures/factures.module";
import { RecaptulatifFinancierComponent } from './recaptulatif-financier/recaptulatif-financier.component';
import { DetailsRecaptulatifFinancierComponent } from './recaptulatif-financier/details-recaptulatif-financier/details-recaptulatif-financier.component';

import { ChartsModule } from 'ng2-charts';


import { MatIconModule } from "@angular/material/icon";
import { MatSliderModule } from '@angular/material';
import { RetenueGarantieComponent } from './retenue-garantie/retenue-garantie.component'


// import { NgProgressHttpModule } from '@ngx-progressbar/http';
// import { NgProgressRouterModule } from '@ngx-progressbar/router';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/chantier/", ".json");
}



@NgModule({
  providers: [
    FournisseurService,
    DepartementService,
    VilleService,
    PaysService,
    UtilisateurService,
    ParameteresService,
    PreviousRouteService,
    ChantierService,
    DocumentAttacherService,
  ],
  imports: [

    CommonModule,
    ChantierRoutingModule,
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
    ClientsModule,
    AngularEditorModule,
    TableArticleModule,
    AddChantierFormModule,
    RebriqueModule,
    CalendarModule,

    ChartsModule,
    MatIconModule,
    MatSliderModule,

    SplitButtonModule,
    // NgProgressModule,
    // NgProgressHttpModule,
    // NgProgressRouterModule



  ],
  declarations: [
    IndexComponent,
    ChantierComponent,
    ShowComponent,
    RecaptulatifFinancierComponent,
    DetailsRecaptulatifFinancierComponent,
    RetenueGarantieComponent,

  ]
})
export class ChantierModule { }
