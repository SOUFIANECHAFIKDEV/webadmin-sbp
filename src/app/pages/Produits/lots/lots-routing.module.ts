import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LotsModule } from './lots.module';
import { lotsComponent } from './lots.component';

const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            component: lotsComponent,
            data: {
                title: 'lots1122'
            }
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LotsRoutingModule { }
