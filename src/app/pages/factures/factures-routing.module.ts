import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { AddFactureComponent } from './add/add.component';
import { UpdateComponent } from './update/update.component';
import { ShowComponent } from './show/show.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: IndexComponent,
      },
      {
        path: 'ajouter/:id',
        component: AddFactureComponent,
      },
      {
        path: 'ajouter',
        component: AddFactureComponent,
      },
      {
        path: 'modifier/:id',
        component: UpdateComponent,
      },
      {
        path: 'detail/:id',
        component: ShowComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacturesRoutingModule { }
