import { Fournisseur } from "./Entities/Fournisseur";

export class PrixParFournisseur {
    id?: number;
    IdProduit?: number;
    idFournisseur?: number;
    prix?: number;
    default: boolean | number;
    fournisseur?:Fournisseur = null;
}

export enum PrixParFournisseur_TypeOfForm {
    add = 1,
    update = 2
}


export class PrixParFournisseur_validation {
    NbOfPricesRequired: number = 1;
    defaultPriceRequired: boolean = true;
    nbDefaultPrice: number = 1;
}

export class PrixParFournisseur_response {
    list: PrixParFournisseur[];
    validation: Validation_response;
}

export class Validation_response {
    defaultPrice: boolean;
    nbOfPrices: boolean;
    isValid: boolean;
}