import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ClientsRoutingModule } from "./clients-routing.module";
import { IndexComponent } from "./index/index.component";
import { AddComponent } from "./add/add.component";
import { UpdateComponent } from "./update/update.component";

import { ClientService } from "./../../services/client/client.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from "angular-datatables";
import { PaysService } from "app/services/pays/pays.service";
import { VilleService } from "app/services/ville/ville.service";
import { DepartementService } from "app/services/departement/departement.service";
import { ShowComponent } from "./show/show.component";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { InformationsComponent } from './show/informations/informations.component';
import { CommonModules } from './../../common/common.module';
import { UtilisateurService } from "./../../services/users/user.service";
import { FileManagerService } from "app/services/fileManager/file-manager.service";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { ProduitService } from '../../services/produit/produit.service';
// import { PrixParClientService } from '../../services/PrixParClient/PrixParClient.service';
import { GroupesModule } from "./Groupe/Groupe.module";
import { AddClientPopComponent } from "./add-client-pop/add-client-pop.component";
import { ClientAuthComponent } from "./show/clientAuth/clientAuth.component";
import { ShowHidePasswordModule } from "ngx-show-hide-password";



export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/clients/", ".json");
}

@NgModule({
  providers: [ClientService,
    PaysService,
    VilleService,
    DepartementService,
    UtilisateurService,
    FileManagerService,
    ParameteresService,
    PreviousRouteService
    /*,ProduitService,PrixParClientService*/
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
    ClientsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    CommonModules,
    NgSelectModule,
    NgbTooltipModule,
    GroupesModule,
    ShowHidePasswordModule,

  ],
  exports: [AddClientPopComponent],
  //entryComponents: [AddComponent, AddClientPopComponent],
  declarations: [IndexComponent,
    UpdateComponent,
    ShowComponent,
    InformationsComponent,
    AddClientPopComponent,
    ClientAuthComponent,
    AddComponent],

})
export class ClientsModule { }
