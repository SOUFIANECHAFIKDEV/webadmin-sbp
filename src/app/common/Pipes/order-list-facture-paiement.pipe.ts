import { Pipe, PipeTransform } from '@angular/core';
import { Facture } from 'app/Models/Entities/Facture';


@Pipe({
    name: 'OrderListFacturePaiement',
    pure: false
})
export class OrderListFacturePaiementPipe implements PipeTransform {

    private cachedList = [];

    constructor() { }

    transform(list: Facture[], args?): any {

        if (list == null) {
            return [];
        }

        list.sort(function (a, b) {
            if (a.dateEcheance > b.dateEcheance) return 1;
            if (a.dateEcheance < b.dateEcheance) return -1;
            return 0;
        });

        return list;
    }

}
