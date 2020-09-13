import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CommonModules } from '../common.module';
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SelectUserComponent } from "./select-user.component";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/common/", ".json");
}

@NgModule({
  providers: [],
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
    DataTablesModule,
    CommonModules,
    NgSelectModule,
    NgbTooltipModule,
    InfiniteScrollModule,
    AngularEditorModule
  ],
  exports: [SelectUserComponent],
  declarations: [SelectUserComponent]
})
export class SelectUserModule { }
