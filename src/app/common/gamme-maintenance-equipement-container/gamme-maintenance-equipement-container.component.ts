import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { LibelleEquipement } from '../gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
    selector: 'gamme-maintenance-equipement-container-component',
    templateUrl: './gamme-maintenance-equipement-container.component.html',
    styleUrls: ['./gamme-maintenance-equipement-container.component.scss']
})
export class gammeMaintenanceEquipementContainerComponent implements OnInit {
    emitter: any = {};
    constructor(
        private translate: TranslateService,
        public dialogRef: MatDialogRef<gammeMaintenanceEquipementContainerComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { listes: LibelleEquipement[], readOnly: boolean, nom: string }) { }
    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        console.log(this.data);
    }
    getOperation(): LibelleEquipement[] {
        return this.emitter.getOperations;
    }

    save() {
        const result: { listes: LibelleEquipement[], nom: string } = {
            listes: this.getOperation(),
            nom: this.data.nom
        }
        this.dialogRef.close(result);
    }
}