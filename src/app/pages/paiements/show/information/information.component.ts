import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Paiement } from 'app/Models/Entities/Paiement';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypePaiement } from 'app/Enums/TypePaiement.Enum';
import { Client } from 'app/Models/Entities/Client';


@Component({
  selector: 'information-paiements',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, OnChanges {

  @Input() paiement: Paiement
  typePaiement: typeof TypePaiement = TypePaiement

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }
  ngOnChanges() {

    this.GetInfoClient();
  }

  GetInfoClient() {
    this.paiement.facturePaiements.forEach(paiement => {
      const infoClient = JSON.parse(paiement.facture.infoClient);
      paiement.facture.client = new Client();
      paiement.facture.client.nom = infoClient.nom;
    });

    const infoClient = JSON.parse(this.paiement.avoir.infoClient);
    this.paiement.avoir.client = new Client();
    this.paiement.avoir.client.nom = infoClient.nom;
  }
}
