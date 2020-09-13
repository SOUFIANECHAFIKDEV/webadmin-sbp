import { SwalConfig } from "./gamme-maintenance-equipement.interface";

export interface Crud_gamme_maintenance_equipement {
    /** ajouter un nouveau lot des opérations */
    ajouterLot(): void;

    /** modifier un lot par son @param id */
    modifierLot(idLot: number): void;

    /** supprimer un lot par son @param id*/
    supprimerLot(idLot: number): void;

    /** ajouter une nouvelle opération dans un lot */
    ajouterOperation(idLot: number): void;

    /** modifier une opération dans un lot */
    modifierOperation(idLot: number, idOperation: number): void;

    /** supprimer une opération dans un lot */
    supprimerOperation(idLot: number, idOperation: number): void;
}

export interface Fonctions_additionnelles {
    /**
     * create configuration pour "Swal" alerte
     * @param text traduction
     */
    swalConfig(text): SwalConfig;
}
