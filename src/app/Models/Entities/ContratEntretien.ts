import { Client } from "./Client";
import { VisiteMaintenance } from "./VisiteMaintenance";

export class ContratEntretien {
  id: number;
  statut: number;
  dateDebut: Date | string;
  dateFin: Date | string;
  site: string;
  memos: string;
  piecesJointes: string;
  historique: string;
  idClient: number;
  client: Client;
  equipementContrat: EquipementContrat[];
  visiteMaintenance: VisiteMaintenance[];
}

export class EquipementContrat {
  id?: number;
  nom: string;
  idContrat?: number;
  contratEntretien?: ContratEntretien;
  libelle: LibelleEquipement[];
}

export class LibelleEquipement {
  id: number;
  nom: string;
  idEquipementContrat: number;
  equipementContrat: EquipementContrat;
  operationsEquipement: OperationsEquipement[];
}


export class OperationsEquipement {
  id: number;
  nom: string;
  idLotEquipement: number;
  libelleEquipement: LibelleEquipement;
  periodicite: PeriodiciteEquipement[];
}

export class PeriodiciteEquipement {
  id: number;
  mois: number;
  statut: number;
  observation: string;
  idOperationsEquipement: number;
  operationsEquipement: OperationsEquipement;
}