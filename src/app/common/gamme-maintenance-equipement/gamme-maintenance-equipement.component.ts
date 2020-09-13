import { Component, Input, OnChanges, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { LibelleEquipement, SwalConfig } from './sheard/interfaces/gamme-maintenance-equipement.interface';
import { moisEnum } from './sheard/enums/mois.enum';

declare var toastr: any;
declare var swal: any;

@Component({
    selector: 'gamme-maintenance-equipement',
    templateUrl: './gamme-maintenance-equipement.component.html',
    styleUrls: ['./gamme-maintenance-equipement.component.scss']
})

export class GammeMaintenanceEquipement implements OnInit,/*Crud_gamme_maintenance_equipement, Fonctions_additionnelles,*/ OnChanges {
    @Input('libelles') libelles: LibelleEquipement[] = [];
    @Input('load') load: { getOperations };
    @Input('readOnly') readOnly: boolean = false;
    public showLibelleAction: number = null;
    public showOperationAction: number = null;
    periodiciteVide = [{ mois: 1, value: false }, { mois: 2, value: false }, { mois: 3, value: false }, { mois: 4, value: false }, { mois: 5, value: false }, { mois: 6, value: false }, { mois: 7, value: false }, { mois: 8, value: false }, { mois: 9, value: false }, { mois: 10, value: false }, { mois: 11, value: false }, { mois: 12, value: false }];
    formInputs
    libelleCrud = {
        showAddLibelleform: false,
        indexLibelle_A_Modifier: null,
        ajouterPeriodiciteAuLibelleIndex: null
    }
    operationCrud = {
        indexLibelle_A_Modifie: null,
        indexOperation_A_Modifier: null,
        indexLibelle_Ajouter: null,
    }
    moisTransalttion = null;

    constructor(private translate: TranslateService) { }
    async ngOnInit() {
        if (this.moisTransalttion == null) {
            this.moisTransalttion = await this.getMonthsTranslation();
        }
    }
    ngOnChanges() {

        this.formInputs = {
            inputString: '',
            periodiciteList: this.periodiciteVide
        }
        if (this.load != undefined) {
            this.load.getOperations = this.libelles;
        }
    }

    /**
     * ajouter un nouveau lot des opérations
     */
    ajouterLot(): void {
        this.translate.get("equipement.errors").subscribe(text => {
            if (this.formInputs.inputString.length < 3) {
                toastr.warning(text.minLengthLibelle, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else {
                const libelle: LibelleEquipement = {
                    nom: this.formInputs.inputString,
                    operations: []
                }
                this.libelles.push(libelle);
                this.initAll();
            }
        });
    }

    /**
     * modifier un lot par son @param id
     */
    modifierLot(): void {

        this.translate.get("equipement.errors").subscribe(text => {
            if (this.formInputs.inputString.length < 3) {
                toastr.warning(text.minLengthLibelle, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else {
                const libelle = this.libelles[this.libelleCrud.indexLibelle_A_Modifier];
                libelle.nom = this.formInputs.inputString;
                this.initAll();
            }
        });
    }

    /**
     * supprimer un lot par son @param id
     */
    supprimerLibelle(indexLot): void {
        this.translate.get("equipement.deleteLibelle").subscribe(text => {
            swal(this.swalConfig(text)).then(isConfirm => {
                if (isConfirm) {
                    this.libelles.splice(indexLot, 1);
                } else {
                    toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
                }
            });
        });
    }

    /**
    * ajouter une nouvelle opération dans un lot
    */
    ajouterOperation(): void {
        debugger
        this.translate.get("equipement.errors").subscribe(text => {
            const periodiciteNb = this.formInputs.periodiciteList.filter(x => x.value == true).length;
            const inputLength = this.formInputs.inputString.length;
            if (inputLength < 3) {
                toastr.warning(text.minLengthNom, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else if (periodiciteNb == 0) {
                toastr.warning(text.periodicite, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else {
                let operations = this.libelles[this.operationCrud.indexLibelle_Ajouter].operations;
                const { inputString, periodiciteList } = this.formInputs;
                operations.push({ nom: inputString, periodicite: periodiciteList });
                this.initAll();
            }
        });
    }

    /**
    * modifier une opération dans un lot
    */
    modifierOperation(): void {
        debugger
        this.translate.get("equipement.errors").subscribe(text => {
            const periodiciteNb = this.formInputs.periodiciteList.filter(x => x.value == true).length;
            const inputLength = this.formInputs.inputString.length;
            if (inputLength < 3) {
                toastr.warning(text.minLengthNom, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else if (periodiciteNb == 0) {
                toastr.warning(text.periodicite, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else {
                this.libelles[this.operationCrud.indexLibelle_A_Modifie]
                    .operations[this.operationCrud.indexOperation_A_Modifier] = {
                        nom: this.formInputs.inputString,
                        periodicite: this.formInputs.periodiciteList
                    };
                this.initAll();
            }
        });
    }

    /**
    * supprimer une opération dans un lot
    */
    supprimerOperation(indexLibelle: number, indexOperation: number): void {
        debugger
        this.initAll();
        this.translate.get("equipement.deleteOperation").subscribe(text => {
            swal(this.swalConfig(text)).then(isConfirm => {
                if (isConfirm) {
                    this.libelles[indexLibelle].operations.splice(indexOperation, 1);
                } else {
                    toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
                }
            });
        });
    }

    /**
     * create configuration pour "Swal" alerte
     * @param text traduction
     */
    swalConfig(text): SwalConfig {
        return {
            title: text.title,
            text: text.question,
            icon: "warning",
            buttons: {
                cancel: {
                    text: text.cancel,
                    value: null,
                    visible: true,
                    className: "",
                    closeModal: true
                },
                confirm: {
                    text: text.confirm,
                    value: true,
                    visible: true,
                    className: "",
                    closeModal: true
                }
            }
        }
    }

    async initAll() {
        debugger
        this.formInputs = {
            inputString: '',
            periodiciteList: [{ mois: 1, value: false }, { mois: 2, value: false }, { mois: 3, value: false }, { mois: 4, value: false }, { mois: 5, value: false }, { mois: 6, value: false }, { mois: 7, value: false }, { mois: 8, value: false }, { mois: 9, value: false }, { mois: 10, value: false }, { mois: 11, value: false }, { mois: 12, value: false }],
        }
        this.libelleCrud = {
            showAddLibelleform: false,
            indexLibelle_A_Modifier: null,
            ajouterPeriodiciteAuLibelleIndex: null
        }
        this.operationCrud = {
            indexLibelle_Ajouter: null,
            // indexOperation_A_jouter: null,

            indexLibelle_A_Modifie: null,
            indexOperation_A_Modifier: null,
        }
    }
    openLabelleEditForm(index: number) {
        debugger
        this.initAll();
        const libelle = this.libelles[index];
        this.formInputs.inputString = libelle.nom;
        if (libelle.periodicite != null) {
            this.formInputs.periodiciteList = libelle.periodicite;
        }
        this.libelleCrud.indexLibelle_A_Modifier = index;
    }
    openOperationEditForm(indexLibelle: number, indexOperation: number) {
        debugger
        this.initAll();
        // this.operationCrud.showEditOperationform = true;
        const operation = this.libelles[indexLibelle].operations[indexOperation];

        this.formInputs.inputString = operation.nom;
        this.formInputs.periodiciteList = operation.periodicite;

        // this.operationCrud.indexLibelle = indexLibelle;
        this.operationCrud.indexOperation_A_Modifier = indexOperation;
        this.operationCrud.indexLibelle_A_Modifie = indexLibelle;
    }

    getMois(index): string {

        try {
            const key = moisEnum[index + 1];
            const t = this.moisTransalttion[key];
            return t;
        } catch (err) {
            return '';
        }
    }

    async getMonthsTranslation(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.translate.get("labels.mois").subscribe(T => {
                resolve(T == 'labels.mois' ? null : T);
            });
        });

    }
    shoowOperation(indexLot, idOperation) {
        if (this.operationCrud.indexLibelle_A_Modifie != indexLot) {
            return true;
        } else {
            if (this.operationCrud.indexOperation_A_Modifier != idOperation) {
                return true;
            } else {
                return false;
            }
        }
    }

    ouverirPeriodiciteAuLibelle(index: number) {
        debugger
        this.initAll();
        this.libelleCrud.ajouterPeriodiciteAuLibelleIndex = index;
        if (this.libelles[index].periodicite != null) {
            this.formInputs.periodiciteList = this.libelles[index].periodicite;
        }
    }

    ajouterPeriodiciteAuLibelle() {
        debugger
        this.translate.get("equipement.errors").subscribe(text => {
            const periodiciteNb = this.formInputs.periodiciteList.filter(x => x.value == true).length;
            if (periodiciteNb == 0) {
                toastr.warning(text.periodicite, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            } else {
                this.libelles[this.libelleCrud.ajouterPeriodiciteAuLibelleIndex].periodicite = this.formInputs.periodiciteList;
                this.initAll();
            }
        });
    }
}