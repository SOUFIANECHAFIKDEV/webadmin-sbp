import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { UpdateComponent } from './update/update.component';
import { ShowComponent } from './show/show.component';
import { InformationComponent } from './show/information/information.component';
import { GammeMaintenanceEquipementRoutingModule } from './gamme-maintenance-equipement-routing.module';
import { CommonModules } from 'app/common/common.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { GammeMaintenanceEquipementModules } from 'app/common/gamme-maintenance-equipement/gamme-maintenance-equipement.module';
import { MatDialogModule } from '@angular/material';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/gammemaintenaceequipement/', '.json');
}
@NgModule({
  declarations: [IndexComponent,
    AddComponent,
    UpdateComponent,
    ShowComponent,
    InformationComponent],
  imports: [
    GammeMaintenanceEquipementRoutingModule,
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
    GammeMaintenanceEquipementModules,
    MatDialogModule
  ],
  providers: [
    PreviousRouteService,
    GammeMaintenanceEquipementService
  ],
  entryComponents: []
})
export class GammeMaintenanceEquipementModule { }
