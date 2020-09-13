import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { AddComponent } from './add/add.component';
import { ShowComponent } from './show/show.component';
import { UpdateComponent } from './update/update.component';
// import { CartComponent } from './cart/cart.component';


const routes: Routes = [{
    path: '',
    children: [
        {
            path: '',
            component: IndexComponent,
            data: {
                title: 'Produits'
            }
        }, {
            path: 'ajouter',
            component: AddComponent,
            data: {
                title: 'Ajouter Produit'
            }
        }, {
            path: 'modifier/:id',
            component: UpdateComponent,
            data: {
                title: 'modifier Produit'
            }
        }, {
            path: 'detail/:id',
            component: ShowComponent,
            data: {
                title: 'detail Produit'
            }
        },
       
        // {
        //     path: 'cart',
        //     component: CartComponent,
        //     data: {
        //         title: 'cart'
        //     }
        // }

    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProduitRoutingModule { }
