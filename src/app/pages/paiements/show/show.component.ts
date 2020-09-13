import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { Paiement } from 'app/Models/Entities/Paiement';

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

  id
  paiement: Paiement
  historique

  constructor(
    private translate?: TranslateService,
    private route?: ActivatedRoute,
    private paiementService?: PaiementService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetPaiementById(this.id);
    });
  }

  GetPaiementById(id) {
    this.paiementService.Get(id).subscribe(res => {
      this.paiement = res;
      this.historique = JSON.parse(res.historique);
    })
  }

}
