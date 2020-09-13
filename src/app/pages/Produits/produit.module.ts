import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IndexComponent } from "./index/index.component"
import { ProduitRoutingModule } from "./produit-routing.module"
import { ProduitService } from '../../services/produit/produit.service';
import { UtilisateurService } from "./../../services/users/user.service";
import { LabelService } from "app/services/labels/labels.service";
import { FournisseurService } from "../../services/fournisseur/fournisseur.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";

import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { AddComponent } from '../Produits/add/add.component';
import { CommonModules } from './../../common/common.module';
import { UpdateComponent } from '../Produits/update/update.component';
import { ShowComponent } from '../Produits/show/show.component';
import { InformationsComponent } from '../Produits/show/informations/informations.component';
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from '@ng-select/ng-select';
// import { PromotionComponent } from './show/promotion/promotion.component';
// import { CalendarModule } from "app/custom-module/primeng/primeng";
import { ImagesHelper } from '../../common/Helpers/images.helper'
import { ShowCrudInProduitModule } from "../../common/Helpers/ShowCrudInProduitModule";

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/fr-BI';
// import { FranchiseComponent } from '../Produits/show/franchise/franchise.component';
import { AngularEditorModule } from '@kolkov/angular-editor';

// import { CartComponent } from './cart/cart.component';
registerLocaleData(localeDECH);



export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, "./assets/i18n/produits/", ".json");
}

@NgModule({
    providers: [
        ProduitService,
        UtilisateurService,
        LabelService,
        FournisseurService,
        ImagesHelper,
        ShowCrudInProduitModule,
        { provide: LOCALE_ID, useValue: 'fr-BI' },
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
        ProduitRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        DataTablesModule,
        CommonModules,
        NgbTooltipModule,
        NgSelectModule,
        // CalendarModule,
        AngularEditorModule
    ],
    declarations: [IndexComponent, AddComponent, UpdateComponent, ShowComponent, InformationsComponent]
})
export class ProduitModule { }