import { InterventionTechnicien } from "./InterventionTechnicien";

export class User {
    id: number;
    nom: string = "";
    prenom: string = "";
    actif: number = 0;
    dernierecon: Date = new Date();
    joinDate: Date = new Date();
    email: string = "";
    phonenumber: string = "";
    accessfailedcount: number = 0;
    username: string = "";
    password: string = "";
    historique: string = "";
    matricule: string = "";
    idProfile: number = 0;
    IdClient: number = 0;
    interventionTechnicien: InterventionTechnicien[];
}