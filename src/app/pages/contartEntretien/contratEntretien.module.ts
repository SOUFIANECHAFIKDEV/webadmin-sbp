import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { UpdateComponent } from './update/update.component';
import { ShowComponent } from './show/show.component';
import { InformationComponent } from './show/information/information.component';

import { CommonModules } from 'app/common/common.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ContratEntretienService } from 'app/services/contratEntretien/contrat-entretien.service';
import { CalendarModule, SplitButtonModule } from 'app/custom-module/primeng/primeng';
import { ContratEntretienRoutingModule } from './contratEntretien-routing.module';
import { ClientService } from 'app/services/client/client.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { MatDialogModule } from "@angular/material";
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { ListeGammeMaintenanceEquipementModules } from 'app/common/liste-gamme-maintenance-equipement/liste-gamme-maintenance-equipement.module';
import { ListeGammeMaintenanceEquipementComponent } from 'app/common/liste-gamme-maintenance-equipement/liste-gamme-maintenance-equipement.component';
import { GammeMaintenanceEquipement } from 'app/common/gamme-maintenance-equipement/gamme-maintenance-equipement.component';
import { gammeMaintenanceEquipementContainerComponent } from 'app/common/gamme-maintenance-equipement-container/gamme-maintenance-equipement-container.component';
import { GammeMaintenanceEquipementModules } from 'app/common/gamme-maintenance-equipement/gamme-maintenance-equipement.module';
import { GammeMaintenanceEquipementContainerModules } from 'app/common/gamme-maintenance-equipement-container/gamme-maintenance-equipement-container.module';
import { VisiteMaintenanceComponent } from './show/visite-maintenance/visite-maintenance.component';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { VilleService } from 'app/services/ville/ville.service';
import { DepartementService } from 'app/services/departement/departement.service';
import { PaysService } from 'app/services/pays/pays.service';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/contratentretien/', '.json');
}
@NgModule({
  declarations: [
    IndexComponent,
    AddComponent,
    UpdateComponent,
    //InformationComponent,
    ShowComponent,
    InformationComponent,
    VisiteMaintenanceComponent,
  ],
  imports: [
    ContratEntretienRoutingModule,
    CommonModule,
    CommonModules,
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
    NgSelectModule,
    NgbTooltipModule,
    DataTablesModule,
    CalendarModule,
    SplitButtonModule,
    MatDialogModule,
    ListeGammeMaintenanceEquipementModules,
    GammeMaintenanceEquipementContainerModules,
    GammeMaintenanceEquipementModules
  ],
  providers: [
    PreviousRouteService,
    GammeMaintenanceEquipementService,
    ContratEntretienService,
    FileManagerService,
    ClientService,
    VisiteMaintenanceService,
    VilleService,
    DepartementService,
    PaysService
  ],
  entryComponents: [ListeGammeMaintenanceEquipementComponent, gammeMaintenanceEquipementContainerComponent]
})
export class ContratEntretienModule { }


