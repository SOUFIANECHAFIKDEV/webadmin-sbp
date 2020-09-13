import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NumerotationPrefixeComponent } from './numerotation-prefixe/numerotation-prefixe.component';
import { PrixComponent } from './prix/prix.component';
// import { CategorieComponent } from './Categorie/categorie.component';
import { LabelsComponent } from './labels/labels.component';
import { TvaComponent } from './tva/tva.component';
import { TypeDocumentComponent } from './type-document/type-document.component';

import { MessagerieComponent } from './messagerie/messagerie.component';
import { HoraireTravailComponent } from './horaire-travail/horaire-travail.component';
import { SyncAgendaGoogleComponent } from './sync-agenda-google/sync-agenda-google.component';
import { ParametrageDocumentComponent } from './parametrage-document/parametrage-document.component';
import { ModelregelementComponent } from './modelregelement/modelregelement.component';
import { ParametrageCompteComponent } from './parametrage-compte/parametrage-compte.component';
import { ComptabiliteComponent } from './comptabilite/comptabilite.component';



const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'numerotationPrefixe',
        component: NumerotationPrefixeComponent
      },
      {
        path: 'messagerie',
        component: MessagerieComponent
      },
      {
        path: 'prix',
        component: PrixComponent
      },
      /*{
        path: 'categorie',
        component: CategorieComponent
      },*/{
        path: 'labels',
        component: LabelsComponent
      }, {
        path: 'tva',
        component: TvaComponent
      },
      {
        path: 'typedocument',
        component: TypeDocumentComponent
      }
      ,
      {
        path: 'modelregelement',
        component: ModelregelementComponent
      },
      {
        path: 'parametragecompte',
        component: ParametrageCompteComponent
      },
      {
        path: 'parametrageDocument',
        component: ParametrageDocumentComponent
      },
      {
        path: 'horairetravail',
        component: HoraireTravailComponent
      },
      {
        path: 'synagenda',
        component: SyncAgendaGoogleComponent
      },
      {
        path: 'comptabilite',
        component: ComptabiliteComponent
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ParameteresRoutingModule { }