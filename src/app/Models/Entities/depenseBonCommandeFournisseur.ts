import { Depense } from "./depense";
import { BonCommandeFournisseur } from "./BonCommandeFournisseur";


export class DepenseBonCommandeFournisseur {
  id: number;
  idBonCommandeFournisseur: number
  idDepense: number
  depense: Depense
  bonCommandeFournisseur: BonCommandeFournisseur
}