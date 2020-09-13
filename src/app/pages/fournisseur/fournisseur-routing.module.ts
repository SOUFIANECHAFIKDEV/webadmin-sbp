import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { ShowComponent } from './show/show.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [{
  path: '',
    children: [
      {
        path: '',
        component: IndexComponent,
        data: {
          title: 'Fournisseurs'
        }
      },
      {
        path: 'ajouter',
        component: AddComponent,
        data: {
          title: 'Ajouter Fournisseur'
        }
      },
      {
        path: 'modifier/:id',
        component: UpdateComponent,
        data: {
          title: 'Modifier Fournisseur'
        }
      },
      {
        path: 'detail/:id',
        component: ShowComponent,
        data: {
          title: 'Details Fournisseur'
        }
      }
    ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FournisseurRoutingModule { }
