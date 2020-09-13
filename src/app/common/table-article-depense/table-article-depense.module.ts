import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { SelectProduitByFournisseurComponent } from './select-produit/select-produit.component';
import { TableArticleDepenseComponent } from './table-article-depense.component';
import { LoginService } from 'app/services/login/login.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { CommonModules } from '../common.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LotsService } from 'app/services/lots/lots.service';
import { LabelService } from 'app/services/labels/labels.service';
import { ClientService } from 'app/services/client/client.service';
import { PaysService } from 'app/services/pays/pays.service';
import { VilleService } from 'app/services/ville/ville.service';
import { DepartementService } from 'app/services/departement/departement.service';
import { UtilisateurService } from 'app/services/users/user.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ProduitService } from 'app/services/produit/produit.service';

import { TableArticleModule } from '../table-article/table-article.module';
import { ProduitFormComponent } from './produit-form/produit-form.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/selectProduit/', '.json');
}
@NgModule({
  providers: [
    LotsService,
    LoginService,
    FournisseurService,
    LabelService,
    ClientService,
    PaysService,
    VilleService,
    DepartementService,
    UtilisateurService,
    FileManagerService,
    ParameteresService,
    PreviousRouteService,
    ProduitService

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
    ReactiveFormsModule,
    DataTablesModule,
    CommonModules,
    NgSelectModule,
    NgbTooltipModule,
    // GroupesModule
    InfiniteScrollModule,
    AngularEditorModule,
  ],
  exports: [TableArticleDepenseComponent],
  declarations: [
    TableArticleDepenseComponent,
    SelectProduitByFournisseurComponent,
    ProduitFormComponent,

  ],

})
export class TableArticleDepenseModule { }
