export class dataTablesParametersModal {
    columns: { data: String, name: String, orderable: Boolean, search: { regex: Boolean, value: String } }[];
    draw: Number;
    length: Number;
    order: { column: number, dir: string }[]
    search: { value: string, regex: boolean }
    start: number
}

// data: String,name: String,orderable: Boolean,search :{regex: Boolean,value: String}