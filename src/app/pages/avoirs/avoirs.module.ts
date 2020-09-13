import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvoirsRoutingModule } from './avoirs-routing.module';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { ShowComponent } from './show/show.component';
import { UpdateComponent } from './update/update.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CalendarModule, SplitButtonModule } from 'app/custom-module/primeng/primeng';
import { DataTablesModule } from 'angular-datatables';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModules } from 'app/common/common.module';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { ClientService } from 'app/services/client/client.service';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
//import { ParametrageDocumentService } from 'app/services/parametragedocument/parametrage-document.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { InformationComponent } from './show/information/information.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TableArticleModule } from 'app/common/table-article/table-article.module';
import { ChantierService } from 'app/services/chantier/chantier.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/avoirs/", ".json");
}

@NgModule({
  declarations: [IndexComponent, AddComponent, ShowComponent, UpdateComponent, InformationComponent],
  imports: [
    CommonModule,
    AvoirsRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    CommonModules,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule,
    DataTablesModule,
    SplitButtonModule,
    AngularEditorModule,
    TableArticleModule,

  ],
  providers: [
    AvoirService,
    ClientService,
    LoginService,
    ParameteresService,
    //ParametrageDocumentService,
    PreviousRouteService,
    ChantierService,
  ]
})
export class AvoirsModule { }
