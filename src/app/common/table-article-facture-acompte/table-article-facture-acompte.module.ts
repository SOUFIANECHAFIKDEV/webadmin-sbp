import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModules } from '../common.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { TableArticleFactureAcompteComponent } from './table-article-facture-acompte.component';
import { DataTablesModule } from 'angular-datatables';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CalendarModule, SplitButtonModule } from 'app/custom-module/primeng/primeng';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/selectProduit/', '.json');
}

@NgModule({
  // tslint:disable-next-line:max-line-length
  providers: [
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
      isolate: true,
    }),
    FormsModule,
    CommonModules,
    ReactiveFormsModule,
    DataTablesModule,
    NgbTooltipModule,
    AngularEditorModule,

    InfiniteScrollModule,
    CalendarModule,

  ],
  exports: [TableArticleFactureAcompteComponent],
  declarations: [
    TableArticleFactureAcompteComponent
  ],
})
export class TableArticleFactureAcompteModule { }
