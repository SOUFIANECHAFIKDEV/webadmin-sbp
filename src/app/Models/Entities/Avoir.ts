import { Client } from "./Client";
import { Facture } from "./Facture";
import { Chantier } from "./Chantier";
import { Paiement } from "./Paiement";
//import { Paiement } from "./Paiement";


export class Avoir {
    id: number;
    reference: string;
    dateCreation: Date | string;
    dateEcheance: Date | string;
    prestations: string
    status: number
    remise: number
    typeRemise: string
    total: number
    historique: string
    memos: string
    infoClient: any
    comptabilise: number
    note: string;
    conditionRegelement: string
    object: string;
    idFacture: number
    idChantier: number
    idClient: number
    chantier: Chantier;
    facture: Facture;
    client: Client;
    paiements: Paiement[];
    totalHt: number;
    compteur: number
    tva: string;
    tvaGlobal: number;
    prorata: number;
    puc: number;
    retenueGarantie: number;
    delaiGarantie: number;
}

export class infoClientModel {
    adresseFacturation: any
    nom: String
    codeClient: String
}
// infoClient
// {
//    "adresseFacturation" : "",
//    "nom":"",
//    "codeClient":"",
// }