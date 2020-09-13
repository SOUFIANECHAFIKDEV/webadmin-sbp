import { Chantier } from "./Chantier";
import { Fournisseur } from "./Fournisseur";
import { Paiement } from "./Paiement";
import { DepenseBonCommandeFournisseur } from "./depenseBonCommandeFournisseur";


export class Depense {
  id: number;
  comptabilise: number;
  reference: string;
  dateCreation: Date | string;
  dateExpiration: Date | string;
  status: number;
  prestations: string;
  total: number;
  totalHt: number;
  tva: number;
  historique: string;
  memos: any;
  categorie: number;
  DocumentAvoir: string;
  objet: string;
  note: string;
  conditionsReglement: string;
  idChantier: number;
  chantier: Chantier;
  idFournisseur: number;
  fournisseur: Fournisseur;
  paiements: Paiement[];
  depenseBonCommandeFournisseurs: DepenseBonCommandeFournisseur[];

}