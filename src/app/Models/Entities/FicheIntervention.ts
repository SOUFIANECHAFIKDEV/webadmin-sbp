import { Chantier } from "./Chantier";
import { Client } from "./Client";
import { InterventionTechnicien } from "./InterventionTechnicien";
import { Facture } from "./Facture";

export class FicheIntervention {
    id: number
    reference: string;
    dateCreation: Date;
    idChantier: number;
    status: number;
    historique: string;
    adresseIntervention: string;
    emails: string;
    chantier: Chantier;
    memos: string;
    dateDebut: Date | string;
    dateFin: Date | string;
    signatureClient: string;
    signatureTechnicien: string;
    prestations: string;
    nombreDeplacement: number;
    nombrePanier: number;
    rapport: string;
    idAgendaGoogle: string;
    idFacture: number;
    facture: Facture;
    interventionTechnicien: InterventionTechnicien[];
    objet:string;
}