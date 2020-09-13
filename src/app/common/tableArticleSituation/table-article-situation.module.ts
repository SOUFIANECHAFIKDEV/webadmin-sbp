 import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModules } from '../common.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TableArticleSituationComponent } from './table-article-situation.component';

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
    NgSelectModule,
    NgbTooltipModule,
  ],
  exports: [TableArticleSituationComponent],
  declarations: [
    TableArticleSituationComponent
  ],
})
export class TableArticleSituationModule {}
