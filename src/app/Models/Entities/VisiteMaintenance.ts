import { ContratEntretien } from "./ContratEntretien";
import { FicheInterventionMaintenance } from "./FicheInterventionMaintenance";


export class VisiteMaintenance {

  id: number;
  statut: number;
  mois: number;
  annee: number;
  gammeMaintenance: string;
  idContratEntretien: number;
  contratEntretien: ContratEntretien;
  ficheInterventionMaintenance: FicheInterventionMaintenance[];
}
export class VisiteMaintenanceViewModel {
  year: number;
  visitesMaintenances: VisiteMaintenance[];
}