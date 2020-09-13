import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Client } from 'app/Models/Entities/Client';
import { ClientService } from 'app/services/client/client.service';
import { AppSettings } from 'app/app-settings/app-settings';
declare var jQuery: any;
@Component({
  selector: 'choix-client-popup',
  templateUrl: './choix-client.component.html',
  styleUrls: ['./choix-client.component.scss']
})
export class ChoixClientComponent implements OnInit {
  idClient
  // clients: Client[] = []
  @Input("clients") clients: Client[] = [];
  @Output('client') client = new EventEmitter();
  @Input('id') idPop = 'choixClient'
  @Input() initSearch = ''
  constructor(

  ) { }

  ngOnInit() {

  }

  /**
   * Choisir Client
   */
  choisirClient() {
    jQuery('#choixClient').modal('hide');
    this.client.emit(this.idClient)
    this.idClient = null;

  }


}
