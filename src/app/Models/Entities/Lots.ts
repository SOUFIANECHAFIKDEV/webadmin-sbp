import { Produit } from "./Produit";

export class Lots {
    id: number;
    nom: string;
    description: string;
    //idlotProduits: number
    lotProduits: LotProduits[];
    // produit : Produit
    remise?: number;
}

export class LotProduits {
    id?: number;
    idLot?: number;
    idProduit?: number;
    qte?: number;
    lots?: Lots;
    idProduitNavigation?: Produit
    remise?: number;
    // produit : Produit
}
export class PrestationsModule {
    data?: Data;
    qte?: number;
    type?: number;
    remise?: number;

}
export class Data {
    id?: number;
    reference?: string;
    nom?: string;
    description?: string;
    designation?: string;
    nomber_heure?: any;
    cout_materiel?: any;
    cout_vente?: any;
    prixHt?: number;
    tva?: number;
    fichesTechniques?: string;
    historique?: string;
    unite?: string;
    categorie?: number;
    labels?: string;
    id_fournisseur?: number;
    prix_fournisseur?: any;

    actif?: number;
    prix?: any;
    typePrix?: string;
    prixOriginal?: number;
    prixParTranche?: string;
    typeRemise?: string = "€";
    qte?: number
    totalHT?: number;
    totalTTC?: number;
    remise?: number
    prixParFournisseur?: any;
    lot?: number;
    lotProduits: LotProduits[];


}