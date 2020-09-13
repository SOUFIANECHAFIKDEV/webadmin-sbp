import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Depense } from 'app/Models/Entities/depense';
import { Avoir } from 'app/Models/Entities/Avoir';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
declare var jQuery: any;
@Component({
  selector: 'pay-by-avoir-depense',
  templateUrl: './pay-by-avoir.component.html',
  styleUrls: ['./pay-by-avoir.component.scss']
})
export class PayByAvoirComponent implements OnInit {
  @Output("refresh") refresh = new EventEmitter()
  @Input("restPayer") restPay: number
  @Input("idChantier") idChantier;
  @Input("depense") depense: Depense;

  restPayCached
  idChantierCached;
  avoirs: Avoir[] = [];
  search = ""
  page = 1;
  totalPages = 0
  finished = true;

  constructor(
    private avoirService?: AvoirService
  ) { }

  ngOnInit() {
    this.GetAvoirs();
    this.restPayCached = this.restPay;
    this.idChantierCached = this.idChantier;
  }
  ngOnChanges() {
    if (this.idChantierCached != this.idChantier || this.restPayCached != this.restPay) {
      this.searchAvoir()
    }
  }

  /**
   * Selectioné Avoir
   */
  selectAvoir(index) {
    this.avoirs.map(x => x["checked"] = false);
    this.avoirs[index]["checked"] = true;
  }
  /**
   * Get Avoir 
   */
  GetAvoirs() {
    if (this.idChantier != null) {
      this.avoirService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, 'dateEcheance', 'asc', [StatutAvoir.Encours], null, null, this.idChantier,null, this.restPay)
        .subscribe(res => {
          this.totalPages = res.totalPages
          let newDepenses = res.list.filter(value => this.avoirs.filter(x => x.id == value.id).length == 0);
          this.avoirs = [...this.avoirs, ...newDepenses]
        })
    }
  }

  /**
   * Recherche dans les avoirs
   */
  searchAvoir() {
    this.avoirs = []
    this.page = 1;
    this.totalPages = 0;
    this.GetAvoirs()
  }

  /**
   * Event Scroll dans la liste des depenses
   */
  onScroll() {
    this.finished = false;
    if (this.totalPages <= this.page) {
      this.finished = true;
    } else {
      this.page++;
      this.GetAvoirs();
    }
  }

  /**
   * Save Paiement
   */
  savePaiement() {
    let selectAvoir = this.avoirs.filter(x => x["checked"] == true)
    if (this.avoirs.filter(x => x["checked"] == true).length > 0) {
      this.refresh.emit(selectAvoir[0])
      jQuery("#choixAvoir").modal("hide");
      this.avoirs = this.avoirs.filter(x => x["checked"] == true)
    }
  }

}
