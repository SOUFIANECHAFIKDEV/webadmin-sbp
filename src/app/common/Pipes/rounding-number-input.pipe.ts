import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'RoudingNumberInput',
    pure: false
})
export class RoudingNumberInputPipe implements PipeTransform {


    transform(number: any, args?: any): any {

        var num = Number(number) // The Number() only visualizes the type and is not needed
        var rounded = Number(num).toFixed(2);

        return parseFloat(rounded);
    }

}
