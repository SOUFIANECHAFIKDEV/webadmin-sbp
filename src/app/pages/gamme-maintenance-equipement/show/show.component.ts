import { Component, OnInit } from '@angular/core';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {
  id
  gammeMaintenanceEquipement: GammeMaintenanceEquipement;
  public processing: boolean = false;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private gammeMaintenanceEquipementService: GammeMaintenanceEquipementService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetGammeMaintenanceEquipement(this.id);

    })
  }

  GetGammeMaintenanceEquipement(id) {
    this.gammeMaintenanceEquipementService.Get(id).subscribe(gammeMaintenanceEquipement => {
      this.gammeMaintenanceEquipement = gammeMaintenanceEquipement;
      //   this.SetData(gammeMaintenanceEquipement);

    });
  }

}
