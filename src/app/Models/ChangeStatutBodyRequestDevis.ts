import { StatutDevis } from "app/Enums/StatutDevis";
import { StatutContratEntretien } from "app/Enums/StatutContratEntretien.Enum";
import { StatutVisiteMaintenance } from "app/Enums/StatutVisiteMaintenance";

export class ChangeStatutBodyRequestDevis {
    idDevis: number;
    statutDevis: StatutDevis;
}

export class ChangeStatutBodyRequestContratEntretien {
    idContratEntretien: number;
    statutContratEntretien: StatutContratEntretien;
}
export class ChangeStatutBodyRequestVisiteMaintenance {
    idVisiteMaintenance: number;
    statutVisiteMaintenance: StatutVisiteMaintenance;
}