import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { ChantierService } from "app/services/chantier/chantier.service";
import { chantierFromComponent } from "./from.component";
import { ClientsModule } from "app/pages/clients/clients.module";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/chantier/", ".json");
}

@NgModule({
  imports: [
    CommonModule,
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
    NgbTooltipModule,
    ClientsModule
  ],
  exports: [chantierFromComponent],
  declarations: [
    chantierFromComponent,
  ]
})
export class AddChantierFormModule { }
