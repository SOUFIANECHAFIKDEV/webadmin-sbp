export class ParametereModel {
    type : number
    name: string
    code: string
    constructor(id, code, name) {
        this.type = id;
        this.name = name;
        this.code = code;
    }
}