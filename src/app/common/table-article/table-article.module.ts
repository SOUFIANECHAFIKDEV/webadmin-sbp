import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientService } from '../../services/client/client.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { PaysService } from 'app/services/pays/pays.service';
import { VilleService } from 'app/services/ville/ville.service';
import { DepartementService } from 'app/services/departement/departement.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModules } from '../common.module';
import { UtilisateurService } from '../../services/users/user.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ProduitService } from '../../services/produit/produit.service';
import { TableArticleComponent } from './table-article.component';
import { SelectProduitComponent } from './select-produit/select-produit.component';
import { SelectLotComponent } from './select-lot/select-lot.component';
import { ProduitFormComponent } from './produit-form/produit-form.component';
// import { PrixParClientService } from '../../services/PrixParClient/PrixParClient.service';
// import { GroupesModule } from "app/pages/clients/Groupe/Groupe.module";
import { LabelService } from 'app/services/labels/labels.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { LoginService } from 'app/services/login/login.service';
import { LotsService } from 'app/services/lots/lots.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatDialogModule } from '@angular/material';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/selectProduit/', '.json');
}

@NgModule({
  // tslint:disable-next-line:max-line-length
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
    ProduitService /*,PrixParClientService*/,
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
    MatDialogModule
  ],
  exports: [TableArticleComponent],
  declarations: [
    TableArticleComponent,
    SelectProduitComponent,
    SelectLotComponent,
    ProduitFormComponent,
  ],
  entryComponents: [SelectLotComponent, SelectProduitComponent]
})
export class TableArticleModule { }
