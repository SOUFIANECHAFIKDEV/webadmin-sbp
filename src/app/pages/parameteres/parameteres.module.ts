import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParameteresRoutingModule } from './parameteres-routing.module';
import { NumerotationPrefixeModule } from './numerotation-prefixe/numerotation-prefixe.module';
import { PrixModule } from './prix/prix.component.module';
// import { CategorieModule } from './Categorie/categorie.module';
import { LabelsModule } from './labels/labels.module';
import { TvaModule } from './tva/tva.component.module';

import { TypeDocumentModule } from './type-document/type-document.module';


import { MessagerieModule } from './messagerie/Messagerie.module';
import { HoraireTravailComponent } from './horaire-travail/horaire-travail.component';
import { HoraireTravailModule } from './horaire-travail/horaire-travail.module';
import { SyncAgendaGoogleModule } from './sync-agenda-google/sync-agenda-google.module';
import { ParametrageDocumentModule } from './parametrage-document/parametrage-document.module';
import { ParametrageCompteModule } from './parametrage-compte/parametrage-compte.module';
import { ModeReglementModule } from './modelregelement/modelregelement.module';
import { CalendarModule } from 'app/custom-module/primeng/primeng';
import { FormsModule } from '@angular/forms';
import { CommonModules } from 'app/common/common.module';
import { ParametrageComptabiliteModule } from './comptabilite/comptabilite.module';




@NgModule({
  providers: [],
  declarations: [],
  imports: [
    CommonModule,
    ParameteresRoutingModule,
    NumerotationPrefixeModule,
    PrixModule,
    // CategorieModule, 
    TypeDocumentModule,
    LabelsModule,
    TvaModule,
    ParametrageDocumentModule,
    MessagerieModule,
    HoraireTravailModule,
    SyncAgendaGoogleModule,
    ParametrageCompteModule,
    ParametrageComptabiliteModule,
    ModeReglementModule,
    FormsModule,
    CommonModules,
    CalendarModule


  ]
})
export class ParameteresModule { }
