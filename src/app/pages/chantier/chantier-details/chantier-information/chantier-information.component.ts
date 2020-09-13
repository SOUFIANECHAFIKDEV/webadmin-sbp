import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TranslateService } from "@ngx-translate/core";
import { Client } from 'app/Models/Entities/Client';
import { StatutChantier } from 'app/Enums/StatutChantier.Enum';
import { ChantierService } from 'app/services/chantier/chantier.service';

@Component({
  selector: 'chantier-information',
  templateUrl: './chantier-information.component.html',
  styleUrls: ['./chantier-information.component.scss']
})
export class ChantierComponent implements OnInit, OnChanges {
  @Input('chantier') chantier: Chantier;
  statutChantier: typeof StatutChantier = StatutChantier;
  tauxAvancement = {
    valueInDb: 0,
    currentValue: 0
  };

  title = 'materialApp';
  disabled = false;
  invert = false;
  thumbLabel = false;
  value = 0;
  vertical = false;
  constructor(private chantierService: ChantierService, ) {

  }
  ngOnInit() {
    if (this.chantier != undefined && this.chantier != null) {
      if (this.chantier.tauxAvancement == null) {
        this.tauxAvancement.currentValue = 0;
        this.tauxAvancement.valueInDb = 0;
      } else {
        this.tauxAvancement.currentValue = this.chantier.tauxAvancement;
        this.tauxAvancement.valueInDb = this.chantier.tauxAvancement;
      }

    }
  }
  ngOnChanges() {
    if (this.chantier != undefined && this.chantier != null) {
      if (this.chantier.tauxAvancement == null) {
        this.tauxAvancement.currentValue = 0;
        this.tauxAvancement.valueInDb = 0;
      } else {
        this.tauxAvancement.currentValue = this.chantier.tauxAvancement;
        this.tauxAvancement.valueInDb = this.chantier.tauxAvancement;
      }
    }

  }

  ChangementTauxAvencement() {
    debugger
    this.chantier.id
    console.log(this.tauxAvancement)
    this.chantierService.changementTauxAvencement({ idChantier: this.chantier.id, tauxAvencement: this.tauxAvancement.currentValue }).subscribe(res => {
      console.log(res)
      if (this.chantier.tauxAvancement == null) {
        this.tauxAvancement.currentValue = 0;
        this.tauxAvancement.valueInDb = 0;
      } else {
        this.tauxAvancement.currentValue = res.tauxAvancement;
        this.tauxAvancement.valueInDb = res.tauxAvancement;
      }
    })
  }
}
