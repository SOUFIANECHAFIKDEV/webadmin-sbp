import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from "angular-datatables";
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { GroupeComponent } from './Groupe.component';
import { CommonModules } from 'app/common/common.module';
import { AddGroupeComponent } from './add/add.component';
import { EditGroupeComponent } from './edit/edit.component';
import { GroupeRoutingModule } from './Groupe-routing.module';
import { ShowComponentGroupe } from '../Groupe/show/show.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/clients/", ".json");
}

@NgModule({
    providers: [],
    declarations: [GroupeComponent, AddGroupeComponent, EditGroupeComponent, ShowComponentGroupe],
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
        CommonModules,
        DataTablesModule,
        NgSelectModule,
        NgbTooltipModule,
        GroupeRoutingModule
    ]
})
export class GroupesModule { }
