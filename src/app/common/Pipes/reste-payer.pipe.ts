import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'RestePayer',
    pure: false
})
export class RestePayerPipe implements PipeTransform {

    private restePayer: number = 0;
    private cachedTotal = "";

    constructor() { }

    transform(total, facturePaiements): any {

        if (total == null || facturePaiements == null) {
            return 0;
        }
        
        if (total !== this.cachedTotal) {
            this.restePayer = null;
            this.cachedTotal = total;

            this.restePayer = total - facturePaiements.reduce((x, y) => x + y.montant, 0)
        }

        return this.restePayer;
    }

}
