import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DashboardPageComponent } from "./dashboard-page.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

const routes: Routes = [
  {
    path: "",
    component: DashboardPageComponent,
    data: {
      title: "Tableau de bord"
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgbTooltipModule,]
})
export class DashboardPagesRoutingModule {}
