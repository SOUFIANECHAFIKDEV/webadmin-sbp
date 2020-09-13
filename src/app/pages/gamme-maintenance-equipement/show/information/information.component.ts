import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { LibelleEquipement } from 'app/common/gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';

@Component({
  selector: 'information-gammeMaintenanceEquipement',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, OnChanges {
  @Input('gammeMaintenanceEquipement') gammeMaintenanceEquipement: GammeMaintenanceEquipement;
  operations: LibelleEquipement[] = [];

  constructor() { }

  ngOnInit() {
  }
  ngOnChanges() {
    if (this.gammeMaintenanceEquipement != null && this.gammeMaintenanceEquipement != undefined) {
      this.operations = JSON.parse(this.gammeMaintenanceEquipement.equipement);
    }
  }


}
