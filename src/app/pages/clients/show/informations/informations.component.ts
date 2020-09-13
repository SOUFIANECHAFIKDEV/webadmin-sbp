import { Component, OnInit, Input } from '@angular/core';
import { Client } from "app/Models/Entities/Client";
import { Contact } from "app/Models/Entities/Contact";
import { Adresse } from "app/Models/Entities/Adresse";

@Component({
  selector: 'client-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss']
})
export class InformationsComponent implements OnInit {
  @Input('client') client: Client;
  @Input('contacts') contacts: Contact[] = [];
  @Input('adresses') adresses: Adresse[];

  constructor() { }

  ngOnInit() {
  }

}
