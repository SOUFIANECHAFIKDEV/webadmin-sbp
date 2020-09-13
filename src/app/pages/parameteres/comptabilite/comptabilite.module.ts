import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from "angular-datatables";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { CommonModules } from 'app/common/common.module';


import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { ComptabiliteComponent } from './comptabilite.component';
import { PeriodeComptableService } from 'app/services/periode-comptable/periode-comptable.service';
import { CalendarModule } from 'app/custom-module/primeng/primeng';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/parametres/", ".json");
}

@NgModule({
  providers: [PeriodeComptableService, ParameteresService],
  declarations: [ComptabiliteComponent],
  imports: [
    CommonModule,
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
    CommonModules,
    DataTablesModule,
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule
  ]
})
export class ParametrageComptabiliteModule { }
