import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/fr-BI';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { lotsComponent } from "./lots.component";
import { lotsFromComponent } from "./lots-form/lotsFrom.component";
import { LotsRoutingModule } from "./lots-routing.module";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { LotsService } from 'app/services/lots/lots.service';
import { CommonModules } from "app/common/common.module";
// import { TableArticleModule } from "app/common/table-article/table-article.module";
registerLocaleData(localeDECH);



export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/lots/", ".json");
}

@NgModule({
    providers: [
        { provide: LOCALE_ID, useValue: 'fr-BI' },
        PreviousRouteService,
        LotsService
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
        FormsModule,
        ReactiveFormsModule,
        DataTablesModule,
        NgbTooltipModule,
        NgSelectModule,
        AngularEditorModule,
        LotsRoutingModule,
        CommonModules,
        // TableArticleModule
    ],
    declarations: [lotsComponent, lotsFromComponent]
})
export class LotsModule { }