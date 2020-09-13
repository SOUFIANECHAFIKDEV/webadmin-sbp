import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupeComponent } from './Groupe.component';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            component: GroupeComponent
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupeRoutingModule { }
