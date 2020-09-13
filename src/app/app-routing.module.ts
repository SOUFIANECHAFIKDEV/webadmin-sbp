import { NgModule } from "@angular/core";
import { RouterModule, Routes, PreloadAllModules } from "@angular/router";

import { DashboardLayoutComponent } from "./layouts/dashboard/dashboard.component";
import { loginLayoutComponent } from "./layouts/login/login.component";

import { FIXED_NAVBAR_FOOTER_ROUTES } from "./shared/routes/dashboard.routes";

import { AuthGuard } from "./shared/auth/auth-guard.service";
import { LoginComponent } from "./pages/login/connecter/login.component";

const appRoutes: Routes = [
  {
    path: "",
    redirectTo: "/dashboard",
    pathMatch: "full",
    canActivate: [AuthGuard]
  },
  {
    path: "",
    component: DashboardLayoutComponent,
    data: { title: "" },
    children: FIXED_NAVBAR_FOOTER_ROUTES,
    canActivate: [AuthGuard]
  }, {
    path: "",
    component: loginLayoutComponent,
    children: [{
      path: 'login',
      loadChildren: './pages/login/login.module#LoginModule'
    }],
    data: { title: "" }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
