import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './chantier-index/chantier-index.component';
import { ShowComponent } from './chantier-details/chantier-details.component';
// import { IndexComponent as DevisIndexComponent } from 'app/pages/devis/index/index.component';
import { AddComponent as DevisAddComponent } from 'app/pages/devis/add/add.component';
import { ShowComponent as DevisShowComponent } from 'app/pages/devis/show/show.component';
import { UpdateComponent as DevisUpdateComponent } from 'app/pages/devis/update/update.component';
import { RebriqueContainerComponent } from './rebrique/rebrique-container/rebrique-container.component';
import { AddFactureSituationComponent } from '../devis/add-facture-situation/add-facture-situation.component';
import { AddFactureComponent } from 'app/pages/factures/add/add.component';
import { UpdateComponent as FactureUpdateComponent } from 'app/pages/factures/update/update.component';
import { ShowComponent as FactureShowComponent } from 'app/pages/factures/show/show.component';
import { ShowComponent as BonCommendeFournisseurShowComponent } from 'app/pages/bonCommandeFournisseur/show/show.component';

import { UpdateComponent as BonCommandeFournisseurUpdateComponent } from 'app/pages/bonCommandeFournisseur/update/update.component';

import { AddComponent as AddBonCommandeFournisseurComponent } from 'app/pages/bonCommandeFournisseur/add/add.component';
import { AddFactureAcompteComponent } from '../devis/add-facture-acompte/add-facture-acompte.component';



const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: IndexComponent,
      data: {
        title: 'Chantier'
      }
    },
    {
      path: 'detail/:id',
      component: ShowComponent,
      data: {
        title: 'Détails chantier'
      }
    },
    {
      path: ':id/documents/:module',
      component: RebriqueContainerComponent,
      data: {
        title: 'Rubrique'
      }
    },
    {
      // ":idChantier/documents/devis/ajouter/:type"
      path: ":idChantier/documents/devis/ajouter",
      component: DevisAddComponent,
      data: {
        title: "Ajouter Devis"
      }
    },

    {
      path: ":idChantier/documents/devis/detail/:id",
      component: DevisShowComponent,
      data: {
        title: "Details Devis"
      }
    },
    {
      path: ":idChantier/documents/devis/modifier/:id",
      component: DevisUpdateComponent,
      data: {
        title: "Modifier Devis"
      }
    },
    {
      path: ":idChantier/documents/devis/:id/factureSituation",
      component: AddFactureSituationComponent,
      data: {
        title: "Facture situation"
      }
    },
    {
      path: ":idChantier/documents/devis/:id/factureAcompte",
      component: AddFactureAcompteComponent,
      data: {
        title: "Facture acompte"
      }
    },
    {
      path: ":idChantier/documents/facturation/ajouter",
      component: AddFactureComponent,
      data: {
        title: "Ajouter Facture"
      }
    },
    {
      path: ":idChantier/documents/facturation/ajouter/:id",
      component: AddFactureComponent,
      data: {
        title: "Ajouter Facture"
      }
    },
    {
      path: ":idChantier/documents/facturation/modifier/:id",
      component: FactureUpdateComponent,
      data: {
        title: "Modifier Facture"
      }
    },
    {
      path: ":idChantier/documents/facturation/detail/:id",
      component: FactureShowComponent,
      data: {
        title: "Details Facture"
      }
    },
    {
      path: ":idChantier/documents/commandes_devis/detail/:id",
      component: BonCommendeFournisseurShowComponent,
      data: {
        title: "Details Bon Commende Fournisseur"
      }
    },

    {
      path: ":idChantier/documents/commandes_devis/ajouter/:id",
      component: AddBonCommandeFournisseurComponent,
      data: {
        title: "Ajouter Bon Commende Fournisseur"
      }
    },
    {
      path: ":idChantier/documents/commandes_devis/ajouter",
      component: AddBonCommandeFournisseurComponent,
      data: {
        title: "Ajouter Bon Commende Fournisseur"
      }
    },

    {
      path: ":idChantier/documents/commandes_devis/modifier/:id",
      component: BonCommandeFournisseurUpdateComponent,
      data: {
        title: "Modifier Bon Commende Fournisseur"
      }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChantierRoutingModule { }
