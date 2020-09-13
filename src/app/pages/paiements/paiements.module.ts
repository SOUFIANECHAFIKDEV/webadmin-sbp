import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementsRoutingModule } from './paiements-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModules } from 'app/common/common.module';

import { IndexComponent } from './index/index.component';

import { PaiementService } from 'app/services/paiement/paiement.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { ShowComponent } from './show/show.component';
import { InformationComponent } from './show/information/information.component';
import { PaiementGroupeComponent } from './index/paiement-groupe/paiement-groupe.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CalendarModule } from 'app/custom-module/primeng/primeng';
import { ModereglementService } from 'app/services/modereglement/modereglement.service';
import { MouvementCompteComponent } from './index/mouvement-compte/mouvement-compte.component';
import { ChantierService } from 'app/services/chantier/chantier.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/paiements/", ".json");
}

@NgModule({
  declarations: [IndexComponent, ShowComponent, InformationComponent, PaiementGroupeComponent, MouvementCompteComponent],
  imports: [
    CommonModule,
    PaiementsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    DataTablesModule,
    CommonModules,
    NgbTooltipModule,
    NgSelectModule,
    FormsModule,
    InfiniteScrollModule,
    ReactiveFormsModule,
    CalendarModule
  ],
  providers: [
    PaiementService,
    PreviousRouteService,
    ParametrageCompteService,
    ModereglementService,
    ParametrageCompteService,
    ChantierService,
  ]
})
export class PaiementsModule { }
