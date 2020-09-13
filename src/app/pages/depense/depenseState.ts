import { Depense } from "app/Models/Entities/depense";



export class DepenseState {
  static depense: Depense = new Depense();
  static idBonCommandeFournisseur: any;
}

export enum CreateDepense {
  DUPLIQUER = 1,
  Bon_Commande_Fournisseur = 2,

}