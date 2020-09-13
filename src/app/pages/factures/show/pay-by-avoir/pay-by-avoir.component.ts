import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { AppSettings } from 'app/app-settings/app-settings';

import { Facture } from 'app/Models/Entities/Facture';
import { Avoir } from 'app/Models/Entities/Avoir';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';

declare var jQuery: any;

@Component({
  selector: 'pay-by-avoir',
  templateUrl: './pay-by-avoir.component.html',
  styleUrls: ['./pay-by-avoir.component.scss']
})
export class PayByAvoirComponent implements OnInit {

  @Output("refresh") refresh = new EventEmitter()
  @Input("restPayer") restPay: number
  @Input("idClient") idClient;
  @Input("facture") facture: Facture;
  @Input("initAvoir") initAvoir: boolean = false;

  restPayCached;
  idClientCached;
  avoirs: Avoir[] = []
  search = ""
  page = 1;
  totalPages = 0
  finished = true;
  AvoirIsInit: boolean = false;

  constructor(
    private avoirService?: AvoirService
  ) { }

  ngOnInit() {
    this.restPayCached = this.restPay;
    this.idClientCached = this.idClient;
  }

  ngOnChanges() {
    debugger
    if (this.initAvoir == true) {
      this.GetAvoirs();
    }

    if ((this.idClientCached != this.idClient || this.restPayCached != this.restPay) && this.initAvoir == true) {
      this.searchAvoir()
    }
  }

  // selectioné avoir
  selectAvoir(index) {
    this.avoirs.map(x => x["checked"] = false);
    this.avoirs[index]["checked"] = true;
  }

  // Get avoirs
  GetAvoirs() {
    if (this.AvoirIsInit == true) {
      return
    }

    if (this.idClient != null) {
      this.avoirService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, 'dateEcheance', 'asc', [StatutAvoir.Encours], null, null, null, this.idClient, this.restPay)
        .subscribe(res => {
          this.totalPages = res.totalPages
          let newFactures = res.list.filter(value => this.avoirs.filter(x => x.id == value.id).length == 0);
          this.avoirs = [...this.avoirs, ...newFactures];
          this.AvoirIsInit = true
        })
    }
  }

  // Recherche dans les avoirs
  searchAvoir() {
    this.avoirs = []
    this.page = 1;
    this.totalPages = 0;
    this.GetAvoirs()
  }

  // Event scroll dans la liste des factures
  onScroll() {
    this.finished = false;
    if (this.totalPages <= this.page) {
      this.finished = true;
    } else {
      this.page++;
      this.GetAvoirs();
    }
  }

  savePaiement() {
    debugger
    let selectedAvoir = this.avoirs.filter(x => x["checked"] == true)
    if (this.avoirs.filter(x => x["checked"] == true).length > 0) {
      this.refresh.emit(selectedAvoir[0])
      jQuery("#choixAvoir").modal("hide");
      this.avoirs = this.avoirs.filter(x => x["checked"] != true)
    }
  }

}
