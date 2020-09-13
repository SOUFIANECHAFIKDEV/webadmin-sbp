import { VisiteMaintenance } from "./VisiteMaintenance";
import { InterventionTechnicienMaintenance } from "./InterventionTechnicienMaintenance";

export class FicheInterventionMaintenance {
  id: number
  reference: string;
  dateCreation: Date;
  status: number;
  historique: string;
  adresseIntervention: string;
  emails: string;
  memos: string;
  // dateIntervention: Date | string;
  dateDebut: Date | string;
  dateFin: Date | string;
  signatureClient: string;
  signatureTechnicien: string;
  idTechnicien: number;
  maintenaceEquipement: string;
  nombreDeplacement: number;
  nombrePanier: number;
  rapport: string;
  //idAgendaGoogle: string;
  //idFacture: number;
  //facture: Facture;
  idVisiteMaintenance: number;
  visiteMaintenance: VisiteMaintenance;
  interventionTechnicienMaintenance: InterventionTechnicienMaintenance;
  objet: string;
}