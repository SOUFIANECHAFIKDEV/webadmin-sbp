import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { DashboardPagesRoutingModule } from "./dashboard-routing.module";
import { DashboardPageComponent } from "./dashboard-page.component";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { AppScheduleModule } from "app/common/app-schedule/app-schedule.module";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/dashboard/", ".json");
}

@NgModule({
  imports: [
    CommonModule,
    DashboardPagesRoutingModule,
    FormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: true
    }),
    AppScheduleModule
  ],
  declarations: [DashboardPageComponent]
})
export class DashboardPagesModule {}
