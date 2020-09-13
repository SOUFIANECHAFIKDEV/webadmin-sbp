import { BonCommandeFournisseur } from "app/Models/Entities/BonCommandeFournisseur";

export class BonCommandeFournisseurState {
  static bonCommandeFournisseur: BonCommandeFournisseur = new BonCommandeFournisseur();
}

export enum CreateBonCommandeFournisseur {
  DUPLIQUER = 1,

}