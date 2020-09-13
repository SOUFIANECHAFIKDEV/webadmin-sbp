import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { IndexComponent } from "./index/index.component";
import { AddComponent } from "./add/add.component";
import { UpdateComponent } from "./update/update.component";
import { ShowComponent } from "./show/show.component";
import { GroupeComponent } from "./Groupe/Groupe.component";
import { AddClientPopComponent } from "./add-client-pop/add-client-pop.component";


export const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: IndexComponent,
        data: {
          title: "Clients"
        }
      },
      {
        path: "ajouter",
        component: AddComponent,
        data: {
          title: "Ajouter Client"
        }
      },
      {
        path: "ajouterClient",
        component: AddClientPopComponent,
        data: {
          title: "Ajouter Client libre"
        }
      },
    
      {
        path: "detail/:id",
        component: ShowComponent,
        data: {
          title: "Details Client"
        }
      },
      {
        path: "modifier/:id",
        component: UpdateComponent,
        data: {
          title: "Modifier Client"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {}
