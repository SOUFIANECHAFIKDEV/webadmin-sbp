import { moisEnum } from "../enums/mois.enum";

// export interface EquipementContrat {
//     nom: string;
//     libelle: LibelleEquipement[];
// }

export interface LibelleEquipement {
    nom: string;
    operations: OperationsEquipement[];
    periodicite?: {
        mois: moisEnum;
        value: boolean;
    }[];
}


export interface OperationsEquipement {
    nom: string;
    periodicite: {
        mois: moisEnum;
        value: boolean;
    }[];
}


export interface SwalConfig {
    title: any;
    text: any;
    icon: string;
    buttons: {
        cancel: {
            text: any;
            value: any;
            visible: boolean;
            className: string;
            closeModal: boolean;
        };
        confirm: {
            text: any;
            value: boolean;
            visible: boolean;
            className: string;
            closeModal: boolean;
        };
    };
}