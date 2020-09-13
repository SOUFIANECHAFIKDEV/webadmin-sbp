import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { ShowComponent } from './show/show.component';
import { UpdateComponent } from './update/update.component';
import { AddFactureSituationComponent } from './add-facture-situation/add-facture-situation.component';
import { AddFactureAcompteComponent } from './add-facture-acompte/add-facture-acompte.component';


export const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: IndexComponent,
        data: {
          title: "Devis"
        }
      },
      {
        // ajouter/:type
        path: "ajouter",
        component: AddComponent,
        data: {
          title: "Ajouter Devis"
        }
      },
      {
        path: "detail/:id",
        component: ShowComponent,
        data: {
          title: "Details Devis"
        }
      },
      {
        path: "modifier/:id",
        component: UpdateComponent,
        data: {
          title: "Modifier Devis"
        }
      },
      {
        path: "factureSituation/:id",
        component: AddFactureSituationComponent,
        data: {
          title: "Modifier Devis"
        }
      },
      {
        path: "factureAcompte/:id",
        component: AddFactureAcompteComponent,
        data: {
          title: "Modifier Devis"
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevisRoutingModule { }
