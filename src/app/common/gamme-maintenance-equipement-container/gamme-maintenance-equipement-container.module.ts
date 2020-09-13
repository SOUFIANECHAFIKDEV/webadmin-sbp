import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { MatDialogModule } from "@angular/material";
import { gammeMaintenanceEquipementContainerComponent } from './gamme-maintenance-equipement-container.component';
import { ContratEntretienModule } from 'app/pages/contartEntretien/contratEntretien.module';
import { GammeMaintenanceEquipementModules } from '../gamme-maintenance-equipement/gamme-maintenance-equipement.module';


export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/common/", ".json");
}

@NgModule({
    exports: [
        gammeMaintenanceEquipementContainerComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgbModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
            isolate: true,
        }),
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
        MatDialogModule,
        GammeMaintenanceEquipementModules
    ],
    declarations: [
        gammeMaintenanceEquipementContainerComponent
    ]
})
export class GammeMaintenanceEquipementContainerModules{ } 
