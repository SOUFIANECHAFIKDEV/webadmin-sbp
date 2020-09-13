import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepenseRoutingModule } from './depense-routing.module';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule, SplitButtonModule } from 'app/custom-module/primeng/primeng';
import { DataTablesModule } from 'angular-datatables';
import { IndexComponent } from './index/index.component';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { FactureService } from 'app/services/facture/facture.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { ClientService } from 'app/services/client/client.service';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { ModereglementService } from 'app/services/modereglement/modereglement.service';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { DepenseService } from 'app/services/depense/depense.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { CommonModules } from 'app/common/common.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AddComponent } from './add/add.component';
import { TableArticleDepenseModule } from 'app/common/table-article-depense/table-article-depense.module';
import { ShowComponent } from './show/show.component';
import { InformationComponent } from './show/information/information.component';
import { UpdateComponent } from './update/update.component';
import { PaiementComponent } from './show/paiement/paiement.component';
import { PayByAvoirComponent } from './show/pay-by-avoir/pay-by-avoir.component';
import { DepenseGroupeBCFComponent } from './index/depense-groupe-bcf/depense-groupe-bcf.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/depenses/", ".json");
}
@NgModule({
  declarations: [IndexComponent, AddComponent, ShowComponent, InformationComponent, UpdateComponent, PaiementComponent, PayByAvoirComponent, DepenseGroupeBCFComponent],
  imports: [
    CommonModule,
    DepenseRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      isolate: true,
    }),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule,
    DataTablesModule,
    CommonModules,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule,
    DataTablesModule,
    SplitButtonModule,
    InfiniteScrollModule,
    AngularEditorModule,
    TableArticleDepenseModule,
  ],
  providers: [
    PreviousRouteService,
    FactureService,
    FileManagerService,
    ChantierService,
    ClientService,
    FicheInterventionService,
    ParameteresService,
    ModereglementService,
    ParametrageCompteService,
    PaiementService,
    DepenseService,
    FournisseurService,



  ],
})
export class DepenseModule { }
