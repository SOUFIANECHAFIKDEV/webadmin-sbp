import { LotProduits } from "./Lots";
import { PrixParFournisseur } from "../prixParFournisseur";

export class Produit {
    id: number;
    reference: string;
    nom: string;
    description: string;
    designation: string;
    nomber_heure: any;
    cout_materiel?: any;
    cout_vente?: any;
    prixHt: number;
    tva: number;
    fichesTechniques: string;
    historique: string;
    unite: string;
    categorie: string;
    labels: string;
    // id_fournisseur: number;
    // prix_fournisseur: any;

    // Pour le calcul dans table produit

    actif: number;
    prix: any;
    typePrix: string;
    prixOriginal: number;
    prixParTranche: string;
    typeRemise: string = "€";

    //prixParFournisseur: PrixParFournisseur[];
    qte: number
    totalHT: number;
    totalTTC: number;
    remise: number
    prixParFournisseur: PrixParFournisseur[];
    lot: number;

    // typeRemise: string = '€'
    lotProduits: LotProduits[];
}