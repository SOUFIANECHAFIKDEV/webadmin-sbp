import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { Client } from 'app/Models/Entities/Client';
import { ClientService } from 'app/services/client/client.service';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';

declare var jQuery: any;

@Component({
  selector: 'choix-chantier-popup',
  templateUrl: './choix-chantier.component.html',
  styleUrls: ['./choix-chantier.component.scss']
})
export class ChoixChantierComponent implements OnInit {

  idChantier
  idFournisseur
  @Input("chantiers") chantiers: Chantier[] = [];

  @Input("fournisseurs") fournisseurs: Fournisseur[] = null
  @Output("onSearch") onSearch = new EventEmitter();
  @Input("id") idPop = "choixChantier"
  @Input("choixfournisseur") choixfournisseur: boolean = false

  constructor(

    private fournisseurService: FournisseurService,
  ) { }

  ngOnInit() {


  }

  // Choisir chantier
  choisirChantier() {

    jQuery("#choixChantier").modal("hide");
    this.onSearch.emit({ idChantier: this.idChantier, idFournisseur: this.idFournisseur })

    this.idChantier = null;
    this.idFournisseur = null;
  }

}
