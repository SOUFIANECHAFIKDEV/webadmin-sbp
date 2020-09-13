import { FicheInterventionMaintenance } from "./FicheInterventionMaintenance";
import { User } from "./User";

export class InterventionTechnicienMaintenance {

  id?: number;
  idFicheInterventionMaintenance?: number;
  idTechnicienMaintenance?: number;
  ficheInterventionMaintenance?: FicheInterventionMaintenance;
  idTechnicienMaintenanceNavigation?: User;
}