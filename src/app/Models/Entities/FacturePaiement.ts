import { Facture } from "./Facture";
import { Paiement } from "./Paiement";

export class FacturePaiement {
    id: number;
    idFacture: number
    idPaiement: number
    montant: number
    facture: Facture
    paiement: Paiement
}