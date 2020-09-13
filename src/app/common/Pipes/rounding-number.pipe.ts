import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'RoudingNumber',
    pure: false
})
export class RoudingNumberPipe implements PipeTransform {


    transform(number: any, args?: any): any {

        var num = Number(number) // The Number() only visualizes the type and is not needed
        var roundedString = num.toFixed(2);
        //var rounded = Number(roundedString)

        return roundedString;
    }

}
