import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BonCommanRoutingModule } from "./bonCommandeFournisseur-routing.module";
import { IndexComponent } from "./index/index.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { CommonModules } from '../../common/common.module';
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { BonCommandeFournisseurService } from "app/services/bonCommandeFournisseur/bonCommandeFournisseur.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { ChantierService } from "app/services/chantier/chantier.service";
import { AddComponent } from "./add/add.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { CalendarModule, SplitButtonModule } from "app/custom-module/primeng/primeng";
import { TableArticleModule } from "app/common/table-article/table-article.module";
import { UpdateComponent } from "./update/update.component";
import { ShowComponent } from "./show/show.component";
import { InformationsComponent } from "./show/informations/informations.component";
import { TableArticleDepenseModule } from "app/common/table-article-depense/table-article-depense.module";
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/BonCommandeFournisseur/", ".json");
}

@NgModule({
  providers: [
    BonCommandeFournisseurService,
    PreviousRouteService,
    ChantierService,
    FournisseurService,
  ],
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
    BonCommanRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    CommonModules,
    NgSelectModule,
    NgbTooltipModule,
    CalendarModule,
    AngularEditorModule,
    TableArticleModule,
    TableArticleDepenseModule,
    SplitButtonModule,
    InfiniteScrollModule,
  ],
  exports: [IndexComponent, AddComponent, UpdateComponent, ShowComponent, InformationsComponent],
  declarations: [IndexComponent, AddComponent, UpdateComponent, ShowComponent, InformationsComponent],

})
export class BonCommandeFournisseurModule { }