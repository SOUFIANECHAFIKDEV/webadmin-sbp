import { Pays } from "./Pays";

export class Fournisseur {
    id: number;
    reference: string;
    nom: string;
    idPays: number;
    ville: string;
    departement: string;
    adresse: string;
    complementAdresse: string;
    codePostal: string;
    telephone: string;
    fax: string;
    email: string;
    siteWeb: string;
    siret: string;
    tvaIntraCommunautaire: string;
    codeComptable: string;
    memos: string;
    contacts: string
    historique: string;
    pays: Pays;
}