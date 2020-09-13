import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisiteMaintenanceRoutingModule } from './visite-maintenance-routing.module';
import { IndexComponent } from './index/index.component';
import { ShowComponent } from './show/show.component';
import { InformationComponent } from './show/information/information.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { ClientService } from 'app/services/client/client.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ContratEntretienService } from 'app/services/contratEntretien/contrat-entretien.service';
import { CommonModules } from 'app/common/common.module';
import { CalendarModule, SplitButtonModule } from 'app/custom-module/primeng/primeng';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/visitemaintenance/', '.json');
}

@NgModule({
  declarations: [
    IndexComponent,
    ShowComponent,
    InformationComponent],
  imports: [
    CommonModule,
    VisiteMaintenanceRoutingModule,
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
    CalendarModule,
    DataTablesModule,
    SplitButtonModule,
    InfiniteScrollModule,
  ],
  providers: [
    PreviousRouteService,
    VisiteMaintenanceService,
    ClientService,
    ContratEntretienService,
    PreviousRouteService,
  ],
})
export class VisiteMaintenanceModule { }
