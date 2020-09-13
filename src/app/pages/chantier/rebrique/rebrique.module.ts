import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgSelectModule } from '@ng-select/ng-select';
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { RebriqueComponent } from "./rubrique-list/rebrique-list.component";
import { DocumentAttacherComponent } from "./rebrique-document/rebrique-document.component";
import { RebriqueContainerComponent } from "./rebrique-container/rebrique-container.component";
import { FormRubriqueComponent } from "./rubrique-form/form-rubrique.component";
import { ChantierRoutingModule } from "../chantier-routing.module";
import { CommonModules } from "app/common/common.module";
import { DevisModule } from "app/pages/devis/devis.module";
import { FacturesModule } from "app/pages/factures/factures.module";
import { BonCommandeFournisseurModule } from "app/pages/bonCommandeFournisseur/bonCommandeFournisseur.module";

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/chantier/", ".json");
}

@NgModule({
    providers: [
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DataTablesModule,
        NgbTooltipModule,
        NgSelectModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            },
            isolate: true
        }),
        ChantierRoutingModule,
        CommonModules,
        DevisModule,
        FacturesModule,
        BonCommandeFournisseurModule,
    ],
    exports: [
        RebriqueComponent,
        FormRubriqueComponent,
        DocumentAttacherComponent,
        RebriqueContainerComponent
    ],
    declarations: [
        RebriqueComponent,
        FormRubriqueComponent,
        DocumentAttacherComponent,
        RebriqueContainerComponent
    ]
})
export class RebriqueModule { }
