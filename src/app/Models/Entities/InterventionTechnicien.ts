import { FicheIntervention } from "./FicheIntervention";
import { User } from "./User";

export class InterventionTechnicien {

    id?: number;
    idFicheIntervention?: number;
    idTechnicien?: number;
    ficheIntervention?: FicheIntervention;
    idTechnicienNavigation?: User;
}