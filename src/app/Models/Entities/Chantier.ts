
import { Client } from "./Client";
import { StatutChantier } from "app/Enums/StatutChantier.Enum";
import { Devis } from "./Devis";
import { Facture } from "./Facture";
import { BonCommandeFournisseur } from "./BonCommandeFournisseur";

export class Chantier {
    id: number;
    nom: string;
    description: string;
    commentaire: string;
    historique: string;
    nombrHeure: number;
    montant: string;
    tauxAvancement: number;
    statut: StatutChantier;
    date_creation: Date = new Date();
    documentation: string;
    idClient: number;
    client: Client;
    devis: Devis[];
    facture: Facture[];
    bonCommandeFournisseur: BonCommandeFournisseur[];
}