import { PrixParFournisseur } from "../prixParFournisseur";

export class Prestation {
    id: number;
    reference: string;
    nom: string;
    // Description: string;
    // Prix: number;
    typePrix: string;
    prixParTranche: string;
    memos: string;
    historique: string;
    tva: number;
    unite: string;
    categorie: number;
    label: string;
    idSociete: string;
    prix: any;
    description: any;
    prixParFournisseur: PrixParFournisseur[];
    actif: number;
    qte: number = 1;
    remise: number = 0;
    totalHT: number = 0;
    totalTTC: number = 0;
    typeRemise: string = "€";
   // produitTypeClient: PrestationTypeClient[];
    prixOriginal: number;
}