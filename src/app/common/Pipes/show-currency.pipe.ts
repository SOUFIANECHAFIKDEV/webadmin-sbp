import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'ShowCurrency',
    pure: false
})
export class ShowCurrencyPipe implements PipeTransform {

    currency = "€"

    transform(number: any, args?: any): any {
        return number + " " + this.currency;
    }

}
