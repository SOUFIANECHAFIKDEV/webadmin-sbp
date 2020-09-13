export class Historique {
    date: Date = new Date();
    IdUser: number;
    action: number;
    champs: { Attribute, After, Before }[] = [];
}