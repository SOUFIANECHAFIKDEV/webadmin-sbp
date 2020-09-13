import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CommonModules } from '../../common/common.module';
import { UtilisateurService } from "../../services/users/user.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { UpdateComponent } from './update/update.component';
import { ShowComponent } from './show/show.component';
import { DevisService } from 'app/services/devis/devis.service';
import { DevisRoutingModule } from './devis-routing.module';
import { NgSelectModule } from "@ng-select/ng-select";
import { FileManagerService } from "app/services/fileManager/file-manager.service";
import { InformationsComponent } from "./show/informations/informations.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { ChantierService } from "app/services/chantier/chantier.service";
import { TableArticleModule } from "app/common/table-article/table-article.module";
import { AddChantierFormModule } from "../../common/chantier-form/add-chantier-form.module";


import { PaiementService } from "app/services/paiement/paiement.service";
import { ModereglementService } from "app/services/modereglement/modereglement.service";
import { ParametrageCompteService } from "app/services/parametragecompte/parametrage-compte.service";
import { CalendarModule, SplitButtonModule } from "app/custom-module/primeng/primeng";
import { FactureService } from "app/services/facture/facture.service";
import { FactureSitutaion } from "./show/facture-situation/facture-situation.component";
import { AddFactureSituationComponent } from "./add-facture-situation/add-facture-situation.component";
import { AddFactureAcompteComponent } from "./add-facture-acompte/add-facture-acompte.component";
import { TableArticleSituationModule } from "app/common/tableArticleSituation/table-article-situation.module";
import { FactureAcompte } from 'app/pages/devis/show/facture-acompte/facture-acompte.component';
import { PdfViewerModule } from "ng2-pdf-viewer";
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/devis/", ".json");
}

@NgModule({
  providers: [
    UtilisateurService,
    FileManagerService,
    ParameteresService,
    PreviousRouteService,
    DevisService,
    ChantierService,

    PaiementService,
    ParametrageCompteService,
    FactureService,
    ModereglementService],
  imports: [
    CommonModule,
    DevisRoutingModule,
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
    AngularEditorModule,
    TableArticleModule,
    AddChantierFormModule,
    CommonModules,
    CommonModule,
    CalendarModule,
    TableArticleSituationModule,
    PdfViewerModule,
    SplitButtonModule,
  ],
  exports: [
    IndexComponent,
    ShowComponent,
    UpdateComponent,
    AddComponent,
    InformationsComponent,
    AddFactureSituationComponent,
    AddFactureAcompteComponent,
    FactureSitutaion
  ],
  declarations: [
    IndexComponent,
    ShowComponent,
    UpdateComponent,
    AddComponent,
    InformationsComponent,
    AddFactureSituationComponent,
    FactureSitutaion,
    FactureAcompte,
    AddFactureAcompteComponent,
  ]
})

export class DevisModule { }
