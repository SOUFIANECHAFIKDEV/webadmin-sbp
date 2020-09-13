import { Pays } from "./Pays";
import { User } from "./User";

export class Franchise {
    id: number;
    reference: string;
    adress: string;
    departement: string;
    complementAdresse: string;
    ville: string;
    codePostal: string;
    numSiret: string;
    numTvaTra: string;
    formeJuridique: string;
    capital: string;
    rcs: string;
    dateFinMiseEnActivite: Date = new Date();
    dateDebutActivite: Date = new Date();
    immatVehicule: string;
    anneeLocationCaddy: number;
    raisonSociale: string;
    telephone: string;
    fax: string;
    contacts: string;
    informations: string;
    memos: string;
    historique: string;
    pays: Pays;
    user: User;
}