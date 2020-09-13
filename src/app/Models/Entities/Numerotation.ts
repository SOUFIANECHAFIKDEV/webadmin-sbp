import { TypeNumerotation } from "app/Enums/TypeNumerotation.Enum";

export class Numerotation {
    Racine: string;
    FormatDate: number;
    Compteur: number;
    LongeurCompteur: number;
    Type: TypeNumerotation;
}

export class Parametrage {
    id: number;
    contenu: string;
    type: number;
}

export class ParametrageContenuDevis {
    note: string;
    conditionReglement: string;
    objet: string;
    note_facture: string;
    conditions_facture: string;
    objet_facture: string;
    validite_facture: any;
    validite_boncommande: any;
}