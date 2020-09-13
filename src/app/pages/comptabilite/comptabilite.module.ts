import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { JournalVenteComponent } from './journal-vente/journal-vente.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ComptabiliteRoutingModule } from './comptabilite-routing.module';
import { CommonModules } from 'app/common/common.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule } from 'app/custom-module/primeng/primeng';
import { DataTablesModule } from 'angular-datatables';
import { ComptabiliteService } from 'app/services/comptabilite/comptabilite.service';
import { JournalAchatComponent } from './journal-achat/journal-achat.component';
import { JournalBanqueComponent } from './journal-banque/journal-banque.component';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/comptabilite/", ".json");
}

@NgModule({
  declarations: [IndexComponent, JournalVenteComponent, JournalAchatComponent, JournalBanqueComponent],
  imports: [
    CommonModule,
    ComptabiliteRoutingModule,
    CommonModules,
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
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule,
    DataTablesModule,
  ],
  providers: [
    ComptabiliteService
  ]
})
export class ComptabiliteModule { }
