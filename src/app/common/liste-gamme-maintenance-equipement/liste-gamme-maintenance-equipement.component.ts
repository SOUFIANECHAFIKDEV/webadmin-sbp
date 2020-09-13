import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
    selector: 'app-liste-gamme-maintenance-equipement',
    templateUrl: './liste-gamme-maintenance-equipement.component.html',
    styleUrls: ['./liste-gamme-maintenance-equipement.component.scss']
})
export class ListeGammeMaintenanceEquipementComponent implements OnInit {
    selected: GammeMaintenanceEquipement[] = [];
    constructor(
        public dialogRef: MatDialogRef<ListeGammeMaintenanceEquipementComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GammeMaintenanceEquipement[]) { }
    search
    ngOnInit() {
    }

    searchProduit() {

    }

    checkElement(id) {
        debugger
        this.selected.unshift(this.data.filter(x => x.id == id)[0]);
        this.data = this.data.filter(x => x.id != id);
    }

    IncheckElement(id) {
        debugger
        this.data.unshift(this.selected.filter(x => x.id == id)[0]);
        this.selected = this.selected.filter(x => x.id != id);
    }

    save() {
        debugger
        if (this.selected.length == 0) {
            toastr.warning('text.serveur', '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        } else {
            this.dialogRef.close(this.selected);
        }
    }
}