import { Chantier } from "./Chantier";
import { Client } from "./Client";
import { Facture } from "./Facture";
import { BonCommandeFournisseur } from "./BonCommandeFournisseur";



export class Devis {
  id: number
  reference: string;
  dateCreation: Date;
  idChantier: number;
  note: string;
  total: number;
  status: number;
  objet: string;
  prestation: string;
  historique: string;
  remise: number;
  typeRemise: string;
  totalHt: number;
  prorata: number;
  puc: number;
  tva: string;
  conditionReglement: string;
  devisExel: string;
  retenueGarantie: number;
  adresseFacturation: string;
  adresseIntervention: string;
  tvaGlobal: number;
  emails: string;
  chantier: Chantier;
  client: Client;
  facture: Facture[];
  bonCommandeFournisseur: BonCommandeFournisseur[];
  delaiGarantie: number;
  situation: string;
  acomptes: string;
  nomberHeure: number;
  coutVente: number;
  coutMateriel: number;
  achatMateriel: number;
}


export class AddFactureSituationbodyRequest {
  idDevis: number;
  situations: FactureSituationDevis;
  facture: Facture
};

export class AddFactureAcomptebodyRequest {
  idDevis: number;
  Acomptes: FactureAcomptesDevis;
  facture: Facture
};


export class FactureSituationDevis {
  idFacture?: number;
  pourcentage: number;
  resteAPayer: number;
  resteAPayerHT: number;
  situationCumulleeTTC: number;
  situationCumulleeHT: number;
  acomptesCumulleeHT: number;
  acomptesCumulleeTTC: number;
};


export class FactureAcomptesDevis {
  idFacture?: number;
  pourcentage: number;
  resteAPayer: number;
  resteAPayerHT: number;
  acomptesCumulleeHT: number;
  acomptesCumulleeTTC: number;
};