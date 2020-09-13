import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { MatDialogModule } from "@angular/material";
import { GammeMaintenanceEquipement } from './gamme-maintenance-equipement.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/common/", ".json");
}

@NgModule({
    exports: [
        GammeMaintenanceEquipement
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
        ShowHidePasswordModule,
        MatDialogModule
    ],
    declarations: [
        GammeMaintenanceEquipement,
    ]
})
export class GammeMaintenanceEquipementModules { } 
