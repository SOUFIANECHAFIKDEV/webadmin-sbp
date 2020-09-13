import { Chantier } from "./Entities/Chantier";
import { ChantierChangeStatusResponseEnum } from "app/Enums/ChantierChangeStatusResponse.Enum";


export class ChantierChangeStatusResponse {
    result: ChantierChangeStatusResponseEnum;
    chantier: Chantier;
}
export class ChantierChangeTauxAvancement {
    result: ChantierChangeStatusResponseEnum;
    chantier: Chantier;
}

export class NbDocumentsChantieModel {
    nbFacture: number = 0;
    nbBC: number = 0;
    nbDevis: number = 0;
}

export class ChangeStatusRetenueGarentieResponse {
    idFacture: number;
    StatusRetenueGarantie: number;
}