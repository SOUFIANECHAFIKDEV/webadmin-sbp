import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { UpdateComponent } from './update/update.component';
import { ShowComponent } from './show/show.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
    children: [
      {
        path: '',
        component: IndexComponent,
        data: {
          title: 'Fiche Intervention'
        }
      },
      {
        path: 'ajouter',
        component: AddComponent,
        data: {
          title: 'Ajouter Fiche Intervention'
        }
      },
      {
        path: 'modifier/:id',
        component: UpdateComponent,
        data: {
          title: 'Modifier Fiche Intervention'
        }
      },
      {
        path: 'detail/:id',
        component: ShowComponent,
        data: {
          title: 'Details Fiche Intervention'
        }
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FicheinterventionRoutingModule { }
